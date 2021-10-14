const express = require('express');
const router = express.Router();

const URL = '/api/works';

const Work = require('../dbmodels/workModel');

router.get(URL, async (req, res) => {
    // script that determines which role ser have and if
    // he is checkman, which firm he work for
    let role;
    let firm;
    let works;
    if (role === 'checkman') {
        works = Work.find({firm});
    } else {
        works = Work.find({});
    }
    res.json(works)
});

router.post(URL, async (req, res) => {
    let works = {...req.body};
    Work.create({...works});
});

module.exports = router;