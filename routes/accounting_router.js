const express = require('express');
const router = express.Router();

const URL = '/accounting';


const accountRoutes = require('./accounting/accounting_routes/accounts_routes')

const workRoutes = require('./accounting/accounting_routes/accounting-types_routes/work');
const refuelingRoutes = require('./accounting/accounting_routes/accounting-types_routes/refueling');
const arrivalRoutes = require('./accounting/accounting_routes/accounting-types_routes/arrival');
const remainRoutes = require('./accounting/accounting_routes/accounting-types_routes/remain');

router.use(URL, accountRoutes, workRoutes, refuelingRoutes, arrivalRoutes, remainRoutes);
module.exports = router;
