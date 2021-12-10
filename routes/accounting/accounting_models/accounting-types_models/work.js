const {schema, SchemaTypes, Schema} = require('mongoose');

const AccountModel = require('../account_model');

const existsPlugin = require('mongoose-exists');
const arrayValidatorPlugin = require('mongoose-array-validator');

const measureUnitHandlersClass = require('../../accounting_middlewares/schemas_middlewares/measure-unit_handlers');
const measureUnitHandlers = new measureUnitHandlersClass;

const fuelSpendingSchema = new Schema({
    inventoryItem: {
        type: SchemaTypes.ObjectId,
        ref: 'InventoryItem'
        
    }
});

const inventoryItemChangeSchema = new Schema({
    inventoryItem: {
        type: SchemaTypes.ObjectId,
        ref: 'InvenotryItem',
        required: true
    },
    measureUnit: {
        type: SchemaTypes.ObjectId,
        ref: 'MeasureUnit',
        validate: {
            validator: measureUnitHandlers.validation
        }
    },
    amount: {
        type: Number,
        required: true,
        set: measureUnitHandlers.conversion
    }
})

const WorkSchema = new Schema({
    workType: {
        type: SchemaTypes.ObjectId,
        ref: 'WorkType',
        required: true,
        exists: true
    },
    fuelConsumption: {
        type: fuelSpendingSchema
    },
    arrival: [{
        type: inventoryItemChangeSchema,
        default: undefined,
        required: false
    }],
    spending: [{
        type: inventoryItemChangeSchema,
        default: undefined,
        required: false
    }]
}, { versionKey: false })

WorkSchema.plugin(existsPlugin);
WorkSchema.plugin(arrayValidatorPlugin);


let WorkModel = AccountModel.discriminator('Work', WorkSchema);

module.exports = WorkModel;