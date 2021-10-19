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

router.delete(URL, async (req, res) => {
    let ids = req.body;                                                  
    await Remainder.deleteMany({_id: { $in: ids}});          
})

router.patch(URL, async (req, res) => {
    let options = {...req.body};                              
    await Remainder.findByIdAndUpdate(options.id, options);         
})

router.patch(`${URL}/confirmed`, async (req, res) => {
    console.log(req.body);
    let confirmed = req.body.confirmed;
    let disconfirmed = req.body.disconfirmed;
    await Remainder.bulkWrite([
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