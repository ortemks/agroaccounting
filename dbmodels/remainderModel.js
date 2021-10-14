const {Schema, model} = require('mongoose');
 
let remainder = new Schema({
    date: {
        type: String
    },
    firm: {
        type: String
    },
    invItem: {
        type: String
    },
    measure: {
        type: String
    },
    amount: {
        type: String
    }
});

module.exports = model('Remainder', remainder);