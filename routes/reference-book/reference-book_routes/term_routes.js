const express = require('express');
const router = express.Router();

const TermModel = require('../reference-book_models/term_model');

const URL = '/terms'

const authentication = require('../../authentication');


router.get(`${URL}`, authentication, async (req, res, next) => {
    let query;
    
    let userRole = res.locals.user.role;
    if (userRole === 'checkamn') {
        let userFirms = res.locals.user.firms;

        query = { $or: [ { firm: { $in: userFirms } }, { firm: { $exists: false } } ] };
    } else {
        query = {};
    }

    let terms = await TermModel.find( query ).sort ({ termType: 1 });

    res.status(200).json(terms);
})

module.exports = router;