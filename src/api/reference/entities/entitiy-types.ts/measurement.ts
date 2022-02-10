import { Schema, SchemaTypes, Types, HydratedDocument } from 'mongoose';
import Entity from '../entity';
import { EntityBaseProperties } from "../entity-modules/entity-class/entity-interface";

import MeasureUnit from './measure-unit';

// Measure-Unit Schema
interface Measurement extends EntityBaseProperties {
    standardMeasureUnit: Types.ObjectId,
    previousMeasureName: Types.ObjectId // do not consists on database
}

const measurementSchema = new Schema<Measurement>( {
    standardMeasureUnit: {
        type: SchemaTypes.ObjectId,
        ref: 'MeasureUnit',
        validate:
        { validator: async function standardMeasureUnitChanging(this: { standardMUmodifiedRatio: number}, value: Types.ObjectId){
            let pointedMeasureUnit = await MeasureUnit.model.findOne({ _id: value });
            console.log(9)
            if (!pointedMeasureUnit) throw new Error(`measure unit with id: ${value} doesn't exist`);
            if (pointedMeasureUnit.measurement.toString() !== (this as any)._conditions?._id.toString() || (this as any)._id.toString() ) throw new Error(`measure unit with id: ${value} belongs to another measurement`);

            this.standardMUmodifiedRatio = pointedMeasureUnit.ratio;
        }, type: 'BAD ID REFERENCE' },
        required: true,
        unique: true
    }
}, { versionKey: false } );

measurementSchema.post('updateOne', async function (this: { standardMUmodifiedRatio: number }) {
    if (this.standardMUmodifiedRatio) await MeasureUnit.model.updateMany( { measurement: (this as any)._conditions._id.toString() }, { $mul: { ratio: 1/this.standardMUmodifiedRatio }})
});


// creating Measure-Unit entity
const measurement: Entity<Measurement> = new Entity('Measurement', measurementSchema);;

measurement.dbInteraction.create = async function (this: Entity<Measurement>, createOptions) {
    //finding if measurement with same name exists
    let sameMeasurement = await this.model.exists({ name: createOptions.name });
    if (sameMeasurement) throw { path: "name", value: createOptions.name, name: "measurement with passed name already exists", type: "BAD CREATE OPTIONS"}
    let sameStandardMeasureUnit = await MeasureUnit.model.findOne( { name: createOptions.standardMeasureUnit } );
    if (sameStandardMeasureUnit) {
        createOptions.standardMeasureUnit = sameStandardMeasureUnit._id;
        return await this.model.create(createOptions);
    }
    
    //validating passed properties
    let fakeCreateOptions = JSON.parse(JSON.stringify(createOptions));
    fakeCreateOptions.standardMeasureUnit = new Types.ObjectId();
    let newMeasurement = new this.model(fakeCreateOptions);
    newMeasurement.validate( Object.keys(createOptions).filter(path => path !== 'standardMeasureUnit') );

    //generating new obbjectid, pass it to new measure unit, then create measurement with standardMeasureUnit path as just created measure unit's id
    let measurementId = new Types.ObjectId();
    let newStandardMeasureUnit = new MeasureUnit.model( { name: createOptions.standardMeasureUnit, ratio: 1, measurement: measurementId, changedBy: createOptions.changedBy } );
    await newStandardMeasureUnit.save( { validateBeforeSave: false });

    createOptions.standardMeasureUnit = (newStandardMeasureUnit as any)._id;
    (createOptions as any)._id = measurementId;
    let measurement = new this.model( createOptions );
    let newMeasurementDoc = await measurement.save( { validateBeforeSave: false } );
    return newMeasurementDoc
}
measurement.dbInteraction.create = measurement.dbInteraction.create.bind(measurement)


export default measurement