const express = require("express");
const app = express();
const PORT = 3000;

const mongoose = require('mongoose');
const dburl = 'mongodb+srv://someone:Artem22121974@cluster0.czjw6.mongodb.net/agrotest?retryWrites=true&w=majority'
 
const worksRoutes = require('./routes/worksRoutes');
const refuelingsRoutes = require('./routes/refuelingsRoutes');
const arrivalsRoutes = require('./routes/arrivalsRoutes');
const remaindersRoutes = require('./routes/remaindersRoutes');
const usersRoutes = require('./routes/usersRoutes');

app.use(express.static(`${__dirname}/client`));
app.use(express.json())

app.use(worksRoutes);
app.use(refuelingsRoutes);
app.use(arrivalsRoutes);
app.use(remaindersRoutes);
app.use(usersRoutes);


async function start(){
    try {
        await mongoose.connect(dburl);
        app.listen(PORT);
        console.log('yep')
    }
    catch (err) {
        console.log(err)
    }
}
start()