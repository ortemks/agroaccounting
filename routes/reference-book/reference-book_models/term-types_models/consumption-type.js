const {Schema} = require('mongoose');

const TermModel = require(`../term_model`);


const uniqueValidator = require('mongoose-unique-validator');

const ConsumptionTypeSchema = new Schema( {
    name: {
        type: String,
        required: [true, `field "name" must be fulfilled`],
        unique: true
    },
    decription: {
        type: String,
        required: false
    }
}, { versionKey: false } );

ConsumptionTypeSchema.plugin(uniqueValidator);


const ConsumptionTypeModel = TermModel.discriminator('ConsumptionType', ConsumptionTypeSchema);

module.exports = ConsumptionTypeModel;