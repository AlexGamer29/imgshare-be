const express = require('express');

const router = express.Router();
const { getAllImages } = require('../../controllers/index.controller');

router.get('/', getAllImages);

module.exports = router;
