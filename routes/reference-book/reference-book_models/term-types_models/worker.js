const {Schema} = require('mongoose');

const TermModel = require('../term_model');


const firmUniqueName = require('../../reference-book_middlewares/models_middlewares/firm_unique-name');

const existsPlugin = require('mongoose-exists');
const arrayValidatorPlugin = require('mongoose-array-validator');

const WorkerSchema = new Schema( {
    firm: {
        type: Schema.Types.ObjectId,
        ref: 'Firm',
        required: true,
        exists: true
    },
    name: {
        type: String,
        required: [true, `field "name" must be fulfilled`],
        validate: {
            validator: firmUniqueName
        }
    },
    workingPosts: [ {
        type: Schema.Types.ObjectId,
        ref: 'WorkingPost',
        required: true,
        uniqueItems: true,
        exists: true
    } ]
}, { versionKey: false } );

WorkerSchema.plugin(existsPlugin);
WorkerSchema.plugin(arrayValidatorPlugin);


const WorkerModel = TermModel.discriminator('Worker', WorkerSchema);

module.exports = WorkerModel;