const {Schema} = require('mongoose');

const TermModel = require('../term_model');


const uniqueValidator = require('mongoose-unique-validator');

const OutfitSchema = new Schema( {
    name: {
        type: String,
        required: [true, `field "name" must be fulfilled`],
        unique: true 
    },
    description: {
        type: String,
        required: false
    }
}, { versionKey: false } );

OutfitSchema.plugin(uniqueValidator);


const OutfitModel = TermModel.discriminator('Outfit', OutfitSchema);

module.exports = OutfitModel;