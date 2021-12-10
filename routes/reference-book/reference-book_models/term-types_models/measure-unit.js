const {Schema, SchemaTypes} = require('mongoose');

const TermModel = require('../term_model');

const uniqueValidator = require('mongoose-unique-validator');
const existsValidator = require('mongoose-exists');

const MeasureUnitSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    measurement: {
        type: SchemaTypes.ObjectId,
        ref: 'Measurement',
        required: true,
        exists: true
    },
    ratio: {
        type: Number,
        required: true,
        validate: {
            validator: async function (value) {
                if (value <= 0) throw new Error(`Measure unit's ratio to standard must be greater than 0, GOT: {VALUE}`);
                if (value = 1) throw new Error(`Added measure unit's ratio can't be 1, GOT: {VALUE} `);

                if ( await MeasureUnitModel.exists({ ratio: value, measurement: this.measurement }) ) 
                    throw new Error(`Measure unit for selected mesurement with same ratio to standard already exists, GOT: {VALUE}`);
            },
            type: 'BAD VALUE'
        }
    }
}, { versionKey: false })

MeasureUnitSchema.plugin(uniqueValidator);
MeasureUnitSchema.plugin(existsValidator);


let MeasureUnitModel = TermModel.discriminator('MeasureUnit', MeasureUnitSchema);

module.exports = MeasureUnitModel;

