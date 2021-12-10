const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const URL = '/interaction';

const User = require('../user_db_models/user_model');


router.post(`${URL}/login`, [
    body('password')
        .notEmpty().withMessage('password is empty').bail()
        .isLength({min: 6}).withMessage('password must contain at least 6 symbols'),   
    body('email')
        .notEmpty().withMessage('email is empty').bail()
        .isEmail().withMessage('invalid email')
    ],  
    async (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json(errors);
        
        let user = await User.findOne(  {email: req.body.email} );
        if (!user) return res.status(400).send('user not found');
        if (req.body.password !== user.password) return res.status(400).send('wrong password'); 
        
        let accessToken = jwt.sign({email: user.email, role: user.role}, process.env.ACCES_TOKEN_SECRET);
        let refreshToken = jwt.sign({email: user.email, role: user.role}, process.env.REFRESH_TOKEN_SECRET);
        res.json({accessToken: accessToken, refreshToken: refreshToken});
    }
);

module.exports = router;