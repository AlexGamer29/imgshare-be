const express = require('express');

const router = express.Router();
const { addNewFriend, removeFriend, listAllFriends, searchFriends } = require('../../controllers/index.controller');

router.post('/add', addNewFriend);
router.post('/remove', removeFriend);
router.get('/', listAllFriends);
router.get('/search', searchFriends);

module.exports = router;
