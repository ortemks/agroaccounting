const {Schema, model} = require('mongoose');

let arrival = new Schema({
    date: {
        type: Date
    },
    firm: {
        type: String
    },
    responsible: {
        type: String
    },
    spending: {
        type: String
    },
    provider: {
        type: String
    },
    stuffName: {
        type: String
    },
    measure: {
        type: String
    },
    amount: {
        type: Number
    },
    currency: {
        type: String
    },
    price: {
        type: Number
    },
    sum: {
        type: Number
    },
    coment: {
        type: String
    }
})

module.exports = model('Arrival', arrival)