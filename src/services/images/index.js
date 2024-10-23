const { getDataWithLimit, countDocuments } = require('../../helpers/query.helper');
const { IMAGES_MODEL } = require('../../constants/modelName.constant');

const getImagesByOwnerId = async (id, start, limit) => {
  try {
    return await getDataWithLimit(IMAGES_MODEL, { ownerId: id }, 'updated_at', start, limit);
  } catch (error) {
    console.error('Error in createUsers:', error);
    throw error;
  }
};

const countImagesByOwnerId = async (ownerId) => {
  try {
    return await countDocuments(IMAGES_MODEL, { ownerId });
  } catch (error) {
    console.error('Error in createUsers:', error);
    throw error;
  }
};

module.exports = {
  getImagesByOwnerId,
  countImagesByOwnerId
};
