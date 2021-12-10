const {model, Schema, SchemaTypes} = require('mongoose');

const AccountModel = require('../account_model');


const ArrivalSchema = new Schema({}, { versionKey: false });

const ArrivalModel = AccountModel.discriminator('Arrival', ArrivalSchema);

module.exports = ArrivalModel