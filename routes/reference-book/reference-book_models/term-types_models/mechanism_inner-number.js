const {Schema, SchemaTypes} = require('mongoose');

const TermModel = require('../term_model');


const firmUniqueName = require('../../reference-book_middlewares/models_middlewares/firm_unique-name');

const existsPlugin = require('mongoose-exists');

const MechanismInnerNumberSchema = new Schema( {
    firm: {
        type: SchemaTypes.ObjectId,
        ref: 'Firm',
        required: true,
        exists: true
    },
    name: {
        type: String,
        required: [true, `field "name" must be fulfilled`],
        validate: { validator: firmUniqueName }
    },
    mechanism: {
        type: SchemaTypes.ObjectId,
        ref: 'Mechanism',
        required: true,
        exists: true
    }
}, { versionKey: false } );

MechanismInnerNumberSchema.plugin(existsPlugin);


const MechanismInnerNumberModel = TermModel.discriminator('MechanismInnerNumber', MechanismInnerNumberSchema)

module.exports = MechanismInnerNumberModel