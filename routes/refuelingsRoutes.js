const express = require('express');
const router = express.Router();

const URL = '/api/accounting/refuelings';

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

router.delete(URL, async (req, res) => {
    let ids = req.body;                                                  
    await Refueling.deleteMany({_id: { $in: ids}});          
})

router.patch(URL, async (req, res) => {
    let options = {...req.body};                              
    await Refueling.findByIdAndUpdate(options.id, options);         
})

router.patch(`${URL}/confirmed`, async (req, res) => {
    console.log(req.body);
    let confirmed = req.body.confirmed;
    let disconfirmed = req.body.disconfirmed;
    await Refueling.bulkWrite([
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