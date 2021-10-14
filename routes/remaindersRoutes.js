const express = require('express');
const router = express.Router();

const URL = '/api/remainders';

const Remainder = require('../dbmodels/remainderModel');

router.get(URL, async (req, res) => {
    // script that determines which role ser have and if
    // he is checkman, which firm he work for
    let role;
    let firm;
    let remainders;
    if (role === 'checkman') {
        remainders = Remainder.find({firm});
    } else {
        remainders = Remainder.find({});
    }
    res.json(remainders)
});

router.post(URL, async (req, res) => {
    let remainder = {...req.body};
    Remainder.create({...remainder})
});

module.exports = router;