const {Schema, model} = require('mongoose');

let User = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
    },
    firm: {
        type: String
    }
})

module.exports = model('User', User);