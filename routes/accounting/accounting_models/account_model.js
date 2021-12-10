const {model, Schema, SchemaTypes} = require('mongoose');

const existsPlugin = require('mongoose-exists');

const AccountingSchema = new Schema({
    firm: {
        type: SchemaTypes.ObjectId,
        required: true,
        exists: true
    },
    date: {
        type: Date,
        required: true
    },
    confirmed: {
        type: Boolean,
        required: false,
        default: false
    },
    comment: {
        type: String,
        required: false
    }
}, { discriminatorKey: 'accountingType', versionKey: false } )

AccountingSchema.plugin(existsPlugin);

const AccountingModel = model('Accounting', AccountingSchema);

module.exports = AccountingModel;

