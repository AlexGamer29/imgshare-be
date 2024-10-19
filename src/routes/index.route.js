const express = require('express');
const router = express.Router();

const auth = require('./auth/auth.route');
const user = require('./user/user.route');
const private = require('./private/private.route');

router.use('/auth', auth);
router.use('/user', user);
router.use('/private', private);
module.exports = router;
