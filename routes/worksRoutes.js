const express = require('express');
const router = express.Router();

const URL = '/api/accounting/works';

const Work = require('../dbmodels/workModel');

router.get(URL, async (req, res) => {
    // script that determines which role ser have and if
    // he is checkman, which firm he work for
    let role;
    let firm;
    let works;
    if (role === 'checkman') {
        works = await Work.find({firm});
    } else {
        works = await Work.find({});
    }
    res.json(works)
});

router.post(URL, async (req, res) => {
    let works = {...req.body};
    Work.create({...works});
});

router.delete(URL, async (req, res) => {
    let ids = req.body;                                 // request body looks like an array from such objects {_id: ''}                       
    await Work.deleteMany({_id: { $in: ids}});          // example: [ { _id: '3242141' }, { _id: '4324032' }, { _id: '534523' } ]
})

router.patch(URL, async (req, res) => {
    let options = {...req.body};                               // request body is an object with _id field and any combination of works particular fields
    await Work.findByIdAndUpdate(options.id, options);         // example: { _id: '3114', date: 'some shitty date', firm: 'some shitty firm' ...}
})

router.patch(`${URL}/confirmed`, async (req, res) => {
    console.log(req.body);
    let confirmed = req.body.confirmed;
    let disconfirmed = req.body.disconfirmed;
    await Work.bulkWrite([
        { updateMany: {
            filter: { _id: { $in: confirmed} },            // request body is an object with confirmed and discnfirmed fields, whcih keys 
            update: { confirmed: 'true'}                   // are arrays with id numbers
        }},                                                // example: { 
        { updateMany: {                                    //            confirmed: [ '34234923f23i', '434534382h2k3', '23932239jt2', 'r3289rh232' ],
            filter: { _id: { $in: disconfirmed} },         //            disconfirmed: ['5786542i5tt4', 'v4483jg5k5', '434854385']
            update: { confirmed: 'false'}                  //          }
        }}
    ])
})

module.exports = router;