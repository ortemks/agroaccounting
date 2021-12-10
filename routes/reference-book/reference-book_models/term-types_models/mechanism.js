const {Schema, SchemaTypes} = require('mongoose');

const TermModel = require('../term_model');
const InventoryItemModel = require('./inventory-item');

const uniqueValidator = require('mongoose-unique-validator');
const existsPlugin = require('mongoose-exists');
const arrayValidatorPlugin = require('mongoose-array-validator');

const MechanismSchema = new Schema( {
    name: {
        type: String,
        required: [true, `field "name" must be fulfilled`],
        unique: true
    },
    fuelUsed: [{
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem',
        required: true,
        exists:true,
        uniqueItems: true,
        validate:  async function (value) {
            let pointedInventoryItem = await InventoryItemModel.findOne({ _id: value });
            let consumptionType = await pointedInventoryItem.populate('consumptionType');
            if (consumptionType.name !== 'топливо') throw new Error(`inventory item's consumption type must be fuel`);
        }
    }],
    oilUsed: [{
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem',
        required: false,
        exists:true,
        uniqueItems: true,
        default: [],
        validate:  async function (value) {
            let pointedInventoryItem = await InventoryItemModel.findOne({ _id: value });
            let consumptionType = await pointedInventoryItem.populate('consumptionType');
            if (consumptionType.name !== 'масла') throw new Error(`inventory item's consumption type must be oil`);
        }
    }],
    description: {
        type: String,
        required: false
    }
}, { versionKey: false } );

MechanismSchema.plugin(uniqueValidator);
MechanismSchema.plugin(existsPlugin);
MechanismSchema.plugin(arrayValidatorPlugin);


const MechanismModel = TermModel.discriminator('Mechanism', MechanismSchema);

module.exports = MechanismModel;