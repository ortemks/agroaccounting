const {Schema, model, SchemaTypes} = require('mongoose');

const uniquePlugin = require('mongoose-unique-validator');
const autopopulatePlugin = require('mongoose-autopopulate');

let TermSchema = new Schema( { 
    disabled: {
        type: Boolean,
        required: false,
        default: false
    }
}, { discriminatorKey: 'termType', versionKey: false} );

TermSchema.plugin(autopopulatePlugin);
TermSchema.plugin(uniquePlugin);

const TermModel = model('Term', TermSchema);

module.exports = TermModel;