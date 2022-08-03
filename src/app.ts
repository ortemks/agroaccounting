require('dotenv').config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import mongoose from 'mongoose';
import api from './api/api';
import { request } from 'https';


const app: express.Application = express();
app.use(express.json());
app.use('/api', api);

let errorHandler: express.ErrorRequestHandler = function (error, req, res, next) {
    let customStatusCode: number | undefined;
    if (error.statusCode) {
        customStatusCode = error.statusCode;
        delete error.statusCode;
    }
    res.status(customStatusCode || 400).send(error);
}
app.use(errorHandler);

    

(async function start(): Promise<void> {
    await mongoose.connect(process.env.DB_URL as string);
    app.listen(process.env.PORT);
    console.log('yep');
})()