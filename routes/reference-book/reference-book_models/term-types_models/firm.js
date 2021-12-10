const {Schema, model} = require('mongoose');

const TermModel = require('../term_model');


const uniqueValidator = require('mongoose-unique-validator');

const FirmSchema = new Schema( {
    name: {
        type: String,
        required: [true, `field "firm" must be fulfilled fwfewf`],
        unique: true
    }
}, { versionKey: false } );

FirmSchema.plugin(uniqueValidator);


const FirmModel = TermModel.discriminator('Firm', FirmSchema);

module.exports = FirmModel;