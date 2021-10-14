const express = require('express');
const router = express.Router();

const URL = '/api/users';

const User = require('../dbmodels/userModel');

router.post(URL, async (req, res) => {
    let {email, password} = {...req.body};
    let sameUser = User.findOne({email, password});
    if (!sameUser) {
        res.status(400);
    }
    res.status(200);
});

module.exports = router;