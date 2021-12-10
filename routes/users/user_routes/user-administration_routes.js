const express = require('express');
const router = express.Router();

const URL = '/administration';

const User = require('../user_db_models/user_model');

router.get(URL, async (req, res, next) => {
    let users = await User.find({});
    res.json(users);
})

router.post(URL, async (req, res, next) => {
    let options = {...req.body};

    let role = options.role;
    if ( (role === 'administrator' || role === 'shef' || role === 'user-admin') && options.firm ) return res.status(400).send(`${role} cannot be attached to a certain firm`)
    //if ( role === 'checkman' )
})

module.exports = router;