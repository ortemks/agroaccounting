require('dotenv').config();

const express = require("express");
const app = express();
const PORT = 3000;

const mongoose = require('mongoose');
const dburl = 'mongodb+srv://someone:Artem22121974@cluster0.czjw6.mongodb.net/agrotest?retryWrites=true&w=majority'
 
const accountingRouter  = require('./routes/accounting_router');
const userRouter = require('./routes/user_router');
const referenceBookRouter = require('./routes/reference-book_router');

app.use(express.static(`${__dirname}/client`));
app.use(express.json());

app.use('/api', accountingRouter, userRouter, referenceBookRouter);

async function start(){
    try {
        await mongoose.connect(dburl);
        app.listen(PORT);
        console.log('yep');
    }
    catch (err) {
        console.log(err)
    }
}
start()