const express = require('express');
const router = express.Router();

const URL = '/user'

const userActionsRoutes = require('./users/user_routes/user-actions_routes')
const userModelRoutes = require('./users/user_routes/user-administration_routes');

router.use(URL, userActionsRoutes, userModelRoutes);

module.exports = router;
