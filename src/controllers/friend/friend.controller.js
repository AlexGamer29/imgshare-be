const { addFriend, unFriend, listFriends, findFriends } = require('../../services/friends');

const addNewFriend = async (req, res) => {
  const { friendId } = req.query;
  try {
    const result = await addFriend(req?.user?.id, friendId);
    res.json({ data: result, error: null });
  } catch (error) {
    res.status(500).send({
      data: null,
      error: error?.name + ': ' + error?.message,
    });
  }
};

const removeFriend = async (req, res) => {
  const { friendId } = req.query;
  try {
    const result = await unFriend(req?.user?.id, friendId);
    res.json({ data: result, error: null });
  } catch (error) {
    res.status(500).send({
      data: null,
      error: error?.name + ': ' + error?.message,
    });
  }
};

const listAllFriends = async (req, res) => {
  try {
    const result = await listFriends(req?.user?.id);
    res.json({ data: result, error: null });
  } catch (error) {
    res.status(500).send({
      data: null,
      error: error?.name + ': ' + error?.message,
    });
  }
};

const searchFriends = async (req, res) => {
  const { searchString } = req.query;
  try {
    const result = await findFriends(req?.user?.id, searchString);
    res.json({ data: result, error: null });
  } catch (error) {
    res.status(500).send({
      data: null,
      error: error?.name + ': ' + error?.message,
    });
  }
};

module.exports = {
  addNewFriend,
  removeFriend,
  listAllFriends,
  searchFriends
};
