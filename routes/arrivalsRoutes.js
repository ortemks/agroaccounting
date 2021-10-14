const express = require('express');
const router = express.Router();

const URL = '/api/arrivals';

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

module.exports = router;