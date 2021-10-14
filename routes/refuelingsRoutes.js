const express = require('express');
const router = express.Router();

const URL = '/api/refuelings';

const Refueling = require('../dbmodels/refuelingModel');

router.get(URL, async (req, res) => {
    // script that determines which role ser have and if
    // he is checkman, which firm he work for
    let role;
    let firm;
    let refuelings;
    if (role === 'checkman') {
        refuelings = Refueling.find({firm});
    } else {
        refuelings = Refueling.find({});
    }
    res.json(refuelings);
});

router.post(URL, async (req, res) => {
    let refueling = {...req.body};
    Refueling.create({...refueling})
});

module.exports = router;