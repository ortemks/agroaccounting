const express = require('express');
const router = express.Router();

const URL = '/api/accounting/arrivals';

const Arrival = require('../dbmodels/arrivalModel');

router.get(URL, async (req, res) => {
    // script that determines which role ser have and if
    // he is checkman, which firm he work for
    let role;
    let firm;
    let arrivals;
    if (role === 'checkman') {
        arrivals = Arrival.find({firm});
    } else {
        arrivals = Arrival.find({});
    }
    res.json(arrivals)
});

router.post(URL, async (req, res) => {
    let arrival = {...req.body};
    Arrival.create({...arrival})
});

router.delete(URL, async (req, res) => {
    let ids = req.body;                                                  
    await Arrival.deleteMany({_id: { $in: ids}});          
})

router.patch(URL, async (req, res) => {
    let options = {...req.body};                              
    await Arrival.findByIdAndUpdate(options.id, options);         
})

router.patch(`${URL}/confirmed`, async (req, res) => {
    console.log(req.body);
    let confirmed = req.body.confirmed;
    let disconfirmed = req.body.disconfirmed;
    await Arrival.bulkWrite([
        { updateMany: {
            filter: { _id: { $in: confirmed} },
            update: { confirmed: 'true'}
        }},
        { updateMany: {
            filter: { _id: { $in: disconfirmed} },
            update: { confirmed: 'false'}
        }}
    ])
})

module.exports = router;