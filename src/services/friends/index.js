const {
  countDocuments,
  findOne,
  insertNewDocument,
  deleteDocument,
  find,
} = require('../../helpers/query.helper');
const {
  FRIENDS_MODEL,
  USERS_MODEL,
} = require('../../constants/modelName.constant');
const models = require('../../database/');
const { Op } = require('sequelize');

const addFriend = async (userId, friendId) => {
  try {
    // Check if the user exists
    const user = await findOne(USERS_MODEL, { id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const checkFriend = await findOne(USERS_MODEL, { id: friendId });
    if (!checkFriend) {
      throw new Error('Friend not found');
    }

    const friendCount = await countDocuments(FRIENDS_MODEL, { userId });
    if (friendCount >= 25) {
      throw new Error('Friend limit reached');
    }

    // Check if the friend relationship already exists
    const existingFriend = await findOne(FRIENDS_MODEL, { userId, friendId });
    if (existingFriend) {
      throw new Error('Already friends');
    }

    const friend = await insertNewDocument(FRIENDS_MODEL, { userId, friendId });
    return { message: 'Friend added successfully', friend };
  } catch (error) {
    throw error;
  }
};

const unFriend = async (userId, friendId) => {
  try {
    const friend = await deleteDocument(FRIENDS_MODEL, { userId, friendId });
    console.log(friend);
    if (friend === 0) {
      throw new Error('Friend not found');
    }
    return { message: 'Friend removed successfully', friend };
  } catch (error) {
    throw error;
  }
};

const listFriends = async userId => {
  try {
    const result = await find(FRIENDS_MODEL, { userId }, [
      {
        model: models[USERS_MODEL],
        as: FRIENDS_MODEL.toLowerCase(),
        attributes: { exclude: ['password'] }, // Exclude password for friends
      },
      {
        model: models[USERS_MODEL],
        as: USERS_MODEL.toLowerCase(),
        attributes: { exclude: ['password'] }, // Exclude password for user
      },
    ]);

    const friends = result.map(ele => ele.friends.dataValues);
    const user = result.length > 0 ? result[0].users.dataValues : null;

    return {
      message: 'Friends listed successfully',
      total: friends.length,
      user,
      friends,
    };
  } catch (error) {
    throw error;
  }
};

const findFriends = async (userId, search) => {
  try {
    const users = await find(
      USERS_MODEL,
      {
        [Op.and]: [
          { username: { [Op.eq]: search } }, // Exact match for username
          { id: { [Op.ne]: userId } }, // Exclude the current user
        ],
      },
      [], // No associations needed
      { attributes: { exclude: ['password'] } } // Exclude password
    );
    return {
      message: 'Friends found successfully',
      total: users.length,
      users,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addFriend,
  unFriend,
  listFriends,
  findFriends,
};
