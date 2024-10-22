const express = require('express');
const router = express.Router();
const { authenticatePasetoToken } = require('../middlewares/index.middleware');

const auth = require('./auth/auth.route');
const user = require('./user/user.route');
const private = require('./private/private.route');
const upload = require('./upload/upload.route');

router.use('/auth', auth);
router.use('/user', user);
router.use('/private', private);
router.use('/upload', authenticatePasetoToken, upload);
module.exports = router;
