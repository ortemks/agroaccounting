require('dotenv').config();

import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';

import userService from './api/user-service/user-service'
const userInteraction = new userService.Interaction();
const userManagement = new userService.Management();
const userAuth = new userService.Auth();

import Firm from './api/firms/firm';
const firm = new Firm();

import Reference from './api/reference/reference';
const reference = new Reference();

import accounting from './api/accounting/accounting';
const work = new accounting.Work();
const refueling = new accounting.Refueling();
const arrival = new accounting.Arrival();
const invetorisation = new accounting.Inventorisation();

const app: express.Application = express()

app.use(express.static(`${__dirname}/client`), helmet(), express.json(), cookieParser(),  compression());

//users
app.use('/api/users/interactions', userInteraction.router);
app.use('/api/users/management', userAuth.middlewares.authenticate, userAuth.middlewares.authorize(['Checkman']), userManagement.router);

//firms
app.use('/api/firms', userAuth.middlewares.authenticate, firm.router);

// reference
app.use('/api/reference', userAuth.middlewares.authenticate,  reference.router)

//accounts
app.use('/api/accounts', userAuth.middlewares.authenticate, work.router, refueling.router, arrival.router, invetorisation.router);

let errorHandler: express.ErrorRequestHandler = function (error, req, res, next) {
    let customStatusCode: number | undefined;
    if (error.statusCode) {
        customStatusCode = error.statusCode;
        delete error.statusCode;
    }
    res.status(customStatusCode || 400).send({ error: error });
}
app.use(errorHandler)
async function start(): Promise<void> {
    await mongoose.connect(process.env.DB_URL as string);
    app.listen(process.env.PORT);
    console.log('yep');
}

start()