const {Schema} = require('mongoose');

const TermModel = require('../term_model');


const uniqueValidator = require('mongoose-unique-validator');

const WorkingPostSchema = new Schema ( {
    name: {
        type: String,
        required: [true, `field "name" must be fulfilled`],
        unique: true
    }
}, { versionKey: false } );

WorkingPostSchema.plugin(uniqueValidator);


const WorkingPostModel = TermModel.discriminator('WorkingPost', WorkingPostSchema);

module.exports = WorkingPostModel;