const express = require('express');
const router = express.Router();

const URL = '/workers'

const WorkerModel = require('../../reference-book_models/term-types_models/worker');


const authentication = require('../../../authentication');

const RequestParsersClass = require('../../reference-book_middlewares/routes_middlewares/request-parsers');
const requestParsers = new RequestParsersClass;

const AuthorizationClass = require('../../reference-book_middlewares/routes_middlewares/authorization');
const authorization = new AuthorizationClass(true);

const responseExecutorsClass = require('../../reference-book_middlewares/routes_middlewares/response-executors');
const responseExecutors = new responseExecutorsClass(WorkerModel, true);


router.get(`${URL}`, authentication, responseExecutors.query);

router.post(`${URL}`, authentication, requestParsers.creation(), authorization.creation, responseExecutors.creation);

router.patch(`${URL}`, authentication, requestParsers.changing(), authorization.changing, responseExecutors.changing);

router.patch(`${URL}/disable`, authentication, requestParsers.disabling(), authorization.disabling, responseExecutors.disabling);

router.delete(`${URL}`, authentication, requestParsers.deletion(), authorization.deletion, responseExecutors.deletion);

module.exports = router;