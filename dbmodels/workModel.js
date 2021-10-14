const {Schema, model} = require('mongoose');

let work = new Schema({
        date: {
            type: String
        },
        firm: {
            type: String
        },
        fuel: {
            type: String
        },
        worker: {
            type: String
        },
        measure: {
            type: String
        },
        filedNum: {
            type: String
        },
        workType: {
            type: String
        },
        mechanism: {
            type: String
        },
        outfit: {
            type: String
        },
        mechanismNum: {
            type: String
        },
        done: {
            type: String
        },
        fuelConsumption: {
            type: String
        },
        employeePrice: {
            type: String
        },
        invItems: {
            type: String
        },
        measureSecond: {
            type: String
        },
        amount: {
            type: String
        },
        invItemsSecond: {
            type: String
        },
        measureThird: {
            type: String
        },
        amountSecond: {
            type: String
        },
        comment: {
            type: String
        },
        status: {
            type: Boolean
        }
    });
    
module.exports = model('Work', work);
