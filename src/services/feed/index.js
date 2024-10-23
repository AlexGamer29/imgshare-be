const { find } = require('../../helpers/query.helper');
const {
  FRIENDS_MODEL,
  IMAGES_MODEL,
} = require('../../constants/modelName.constant');
const { Op } = require('sequelize');

const getFeedImages = async userId => {
  try {
    // Find all friends of the user
    const friends = await find(FRIENDS_MODEL, { userId }, [], {
      attributes: ['friendId'],
    });
    const friendIds = friends.map(friend => friend.friendId);

    // Include the user's own ID
    friendIds.push(userId);

    // Find all images of the user and their friends
    const images = await find(
      IMAGES_MODEL,
      { ownerId: { [Op.in]: friendIds } },
      [],
      { order: [['updated_at', 'DESC']] }
    );

    return {
      message: 'Feed retrieved successfully',
      total: images.length,
      images,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getFeedImages,
};
