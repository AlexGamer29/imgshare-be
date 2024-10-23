const express = require('express');
const router = express.Router();
const { authenticatePasetoToken } = require('../middlewares/index.middleware');

const auth = require('./auth/auth.route');
const user = require('./user/user.route');
const private = require('./private/private.route');
const upload = require('./upload/upload.route');
const image = require('./image/image.route');
const friend = require('./friend/friend.route');
const feed = require('./feed/feed.route');

router.use('/auth', auth);
router.use('/user', user);
router.use('/private', private);
router.use('/upload', authenticatePasetoToken, upload);
router.use('/image', authenticatePasetoToken, image);
router.use('/friend', authenticatePasetoToken, friend);
router.use('/feed', authenticatePasetoToken, feed);
module.exports = router;
