const {Schema, SchemaTypes} = require('mongoose');

const TermModel = require('../term_model');


const uniqueValidator = require('mongoose-unique-validator');
const existsPlugin = require('mongoose-exists');
const arrayValidatorPlugin = require('mongoose-array-validator');

const WorkTypeSchema = new Schema( {
    name: {
        type: String,
        required: [true, `field "name" must be fulfilled`],
        unique: true
    },
    Measurement: [{
        type: SchemaTypes.ObjectId,
        ref: 'Measurement',
        required: true,
        exists: true,
        uniqueItems: true
    }],
    description: {
        type: String, 
        required: true
    },
    arrival: [{
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem',
        required: false,
        exists: true,
        uniqueItems: true,
        default: []
    }],
    spending: [{
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem',
        required: false,
        exists: true,
        uniqueItems: true,
        default: []
    }],
}, { versionKey: false } );

WorkTypeSchema.plugin(uniqueValidator);
WorkTypeSchema.plugin(existsPlugin);
WorkTypeSchema.plugin(arrayValidatorPlugin);


const WorkTypeModel = TermModel.discriminator('WorkType', WorkTypeSchema);

module.exports = WorkTypeModel;

