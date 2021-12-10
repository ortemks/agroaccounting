const express = require('express');
const router = express.Router();

const URL = `/arrivals`
const ArrivalModel = require('../../accounting_models/accounting-types_models/arrival');

module.exports = router