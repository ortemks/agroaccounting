const {Schema, SchemaTypes} = require('mongoose');

const TermModel = require('../term_model');

const uniqueValidator = require('mongoose-unique-validator');
const existsPlugin = require('mongoose-exists');

const InventoryItemSchema = new Schema( {
    name: {
        type: String,
        required: [true, `field "name" must be fulfilled`],
        unique: true
    },
    consumptionType: {
        type: SchemaTypes.ObjectId,
        ref: 'ConsumptionType',
        required: [true, `field "consmptionType" must be fulfeilled`],
        exists: true
    },
    measurement: {
        type: SchemaTypes.ObjectId,
        ref: 'Measurement',
        required: [true, `quantityMeasured must contain at least 1 value`],
        exists: true
    },
    description: {
        type: String,
        required: false
    }
}, { versionKey: false } );

InventoryItemSchema.plugin(uniqueValidator);
InventoryItemSchema.plugin(existsPlugin);


const InventoryItemModel = TermModel.discriminator('InventoryItem', InventoryItemSchema);

module.exports = InventoryItemModel;