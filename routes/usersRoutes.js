const express = require('express');
const router = express.Router();

const URL = '/api/users';

const User = require('../dbmodels/userModel');

router.post(URL, async (req, res) => {
    try {
        let email = req.body.email;
        console.log(email);
        let user = await User.findOne({email: email});
        if (!user) {
            res.status(400).send('user not found');
        }
        let password = req.body.password;
        if (password !== user.password) {
            res.status(400).send('ivalid password');
        } 
        res.status(200).send('got it');
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;