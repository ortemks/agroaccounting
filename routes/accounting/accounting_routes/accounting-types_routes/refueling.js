const express = require('express');
const router = express.Router();

const URL = `/refuelings`
const RefuelingModel = require('../../accounting_models/accounting-types_models/refueling');

module.exports = router