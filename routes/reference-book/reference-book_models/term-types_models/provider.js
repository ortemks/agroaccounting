const {Schema} = require('mongoose');

const TermModel = require('../term_model');


const uniqueValidator = require('mongoose-unique-validator');

const ProviderSchema = new Schema( {
    name: {
        type: String,
        required: [true, `field "name" must be fulfilled`],
        unique: true
    }
}, { versionKey: false } );

ProviderSchema.plugin(uniqueValidator);


const ProviderModel = TermModel.discriminator('Provider', ProviderSchema);

module.exports = ProviderModel;