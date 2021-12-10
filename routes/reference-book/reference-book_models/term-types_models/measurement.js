const {Schema, SchemaTypes} = require('mongoose');

const TermModel = require('../term_model');
const MeasureUnitModel = require('./measure-unit');

const uniqueValidator = require('mongoose-unique-validator');


const MeasurementSchema = new Schema( {
    name: {
        type: String,
        required: true,
        unique: true
    },
    standardMeasureUnit: {
        type: String,
        required: true,
        unique: true,
        set: function (value) {
            //getting current standard Measure Units name
            this.previousMeasureName = this.standardMeasureUnit;
            return value
        }
    }
}, { versionKey: false } )

//setting new standard Measure Unit
MeasurementSchema.pre('save', async function () {
    let measurement = this._id;
    
    let newMeasureUnitName = this.standardMeasureUnit;
    let previousMeasureUnitName = this.previousMeasureName;
    
    //checking if this measurement is created or changed
    if (previousMeasureUnitName) {
        //disabling previous standard measure unit
        await MeasureUnitModel.updateOne( {name: previousMeasureUnitName}, { disabled: true } );

        // finding and updating measure unit with same name
        let updatedNew = await MeasureUnitModel.updateOne( {name: newMeasureUnitName, measurement: measurement}, {ratio: 1, disabled: false});
        // if such measure unit was found, skiping next step
        if (updatedNew.matchedCount) return
    }
    
    //in cases where document is created or such measure unit wasn't found, creating new measure unit
    let newStandardMeasureUnit = new MeasureUnitModel ( { name: newMeasureUnitName, measurement: this._id, ratio: 1} );
    await newStandardMeasureUnit.save({ validateBeforeSave: false });
})

MeasurementSchema.plugin(uniqueValidator);


const MeasurementModel = TermModel.discriminator('Measurement', MeasurementSchema);

module.exports = MeasurementModel;