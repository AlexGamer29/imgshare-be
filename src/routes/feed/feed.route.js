const express = require('express');

const router = express.Router();
const { getFeed } = require('../../controllers/index.controller');

router.get('/', getFeed);

module.exports = router;
