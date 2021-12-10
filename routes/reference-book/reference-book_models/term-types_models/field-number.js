const {Schema, SchemaTypes} = require('mongoose');

const TermModel = require('../term_model');


const firmUniqueName = require('../../reference-book_middlewares/models_middlewares/firm_unique-name');

const existsPlugin = require('mongoose-exists');
const setAutopopulatePlugin = require('../../reference-book_middlewares/models_middlewares/set_autopopulate_plugin');

const FieldNumberSchema = new Schema( {
    firm: {
        type: SchemaTypes.ObjectId,
        ref: 'Firm',
        required: [true, `field "firm" must be fulfilled`],
        exists: true
    },
    name: {
        type: String,
        required: [true, `field "name" must be fulfilled`],
        validate: { validator: firmUniqueName }
    }
}, { versionKey: false } );

FieldNumberSchema.plugin(existsPlugin);
FieldNumberSchema.plugin(setAutopopulatePlugin);

const FieldNumberModel = TermModel.discriminator('FieldNumber', FieldNumberSchema);

module.exports = FieldNumberModel;