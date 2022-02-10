import { ObjectId, Schema, SchemaTypes, FilterQuery } from 'mongoose';
import Entity from '../entity';
import { EntityBaseProperties } from "../entity-modules/entity-class/entity-interface";
import checkExistance from '../entity-modules/entity-types/checkExistance';

import Measurement from "./measurement"

// Measure-Unit Schema
interface MeasureUnit extends EntityBaseProperties {
    measurement: ObjectId,
    ratio: number
}

const measureUnitSchema = new Schema<MeasureUnit>( {
    measurement: {
        type: SchemaTypes.ObjectId,
        ref: 'Measurement',
        required: true,
        validate: [ checkExistance('Measurement') ],
        immutable: true
    },
    ratio: {
        type: Number,
        required: true,
        validate: {
            validator: async function (value: number) {
                if (value <= 0) throw new Error(`Measure unit's ratio to standard must be greater than 0, GOT: {VALUE}`);
                if (value === 1) throw new Error(`Added measure unit's ratio can't be 1, GOT: {VALUE} `);

                //if ( await MeasureUnitModel.exists({ ratio: value, measurement: this.measurement }) ) 
                //    throw new Error(`Measure unit for selected mesurement with same ratio to standard already exists, GOT: {VALUE}`);
            },
            type: 'BAD VALUE'
        }
    }
}, { versionKey: false } );

// creating Measure-Unit entity
const MeasureUnit: Entity<MeasureUnit> = new Entity('MeasureUnit', measureUnitSchema);

MeasureUnit.dbInteraction.update = async function (this: Entity<MeasureUnit>, updateOptions, options = {} ) {
    let filter: FilterQuery<MeasureUnit> = updateOptions.filter;
    let update = updateOptions.update as Partial<MeasureUnit>;

    let firmRestrictions = options.firmRestrictions;
    if (firmRestrictions && firmRestrictions.length > 0) {
        this.firmRestrictions.onSet(update, firmRestrictions);
        this.firmRestrictions.onFind(filter, firmRestrictions)
    }


    await this.model.find(filter).cursor().eachAsync( async (doc) => {
        if (update.ratio && doc.ratio === 1) throw { path: 'update.ratio', name: `can't change measure unit's ratio until it standard`, type: 'BAD UPDATE PROPERTIES'} ;

        for (let key in update) {
            (doc as any)[key] = (update as any)[key];
        }
        await doc.save({ validateModifiedOnly: true});
    });
} 

export default MeasureUnit