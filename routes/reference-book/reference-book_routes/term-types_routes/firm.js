const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');

const URL = '/firms';

const TermModel = require('../../reference-book_models/term_model');

const FirmModel = require('../../reference-book_models/term-types_models/firm');

const authentication = require('../../../authentication');

router.get(`${URL}`, authentication, async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors);

    let query;

    let userRole = res.locals.user.role;
    if (userRole === 'checkman') {
        let userFirms = res.locals.user.firms;

        query = { firm: { $in: userFirms } };
    }

    let firms = await FirmModel.find(query);

    res.status(200).json(firms);
})

router.post(`${URL}`, authentication, async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors);

    let userRole = res.locals.user.role;
    if (userRole === 'checkman') return res.status(403).send(`checkmans can't create new firms`);

    let requestOptions = {...req.body};

    try {
        let newFirm = new FirmModel( {name: requestOptions.name} );
        await newFirm.save();
    } catch (errors) {
        return res.status(400).send(errors)
    }
    res.status(201).send(`new firm created`)
})

router.patch(`${URL}/disable`, [
    body('_id').
        notEmpty().withMessage(`field must be fulfilled`).bail()
        .isMongoId().withMessage(`field must be mongoId`).custom( async ( value, {req} ) => {
            let termExist = await FirmModel.exists({ _id: value });
            if (!termExist) throw new Error(`firm with id ${value} doesn't exist`);
            req.locals.firmDisabledId = value
        })
], authentication, async function (req, res) {
    let errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors);
    let firmDisabledId = req.locals.firmDisabledId;

    let userRole = res.locals.user.role;
    if (userRole === 'checkman') return res.status(400).send(`chekman can't disable firm`)
    await TermModel.bulkWrite([
        {
            updateOne: {
                filter: { _id: firmDisabledId },
                update: { disabled: true }
            }
        },
        {
            updateMany: {
                filter: { firm: firmDisabledId },
                update: { disabled: true }
            }
        }
    ])
})


module.exports = router;