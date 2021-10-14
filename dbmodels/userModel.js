const {Schema, model} = require('mongoose');

let user = new Schema({
    email: {
        type: String
    },
    password: {
        type: String
    },
    role: {
        type: String
    }
})

module.exports = model('User', user);