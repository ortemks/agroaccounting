const {Schema, model} = require("mongoose");
 
let refueling = new Schema({
    date: {
        type: String
    },
    innerNum: {
        type: String
    },
    firm: {
        type: String
    },
    technique: {
        type: String
    },
    fueled: {
        type: Number // в литрах
    },
    arrival: {
        type: String
    },
    fuelType: {
        type: String
    },
    comment: {
        type: String
    },
    status: {
        type: Boolean
    }
})

module.exports = model('Refueling', refueling);