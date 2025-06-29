const { getDataWithLimit, countDocuments } = require('../../helpers/query.helper');
const { IMAGES_MODEL } = require('../../constants/modelName.constant');

const { cacheHelper, RedisKeys, RedisTTL } = require('../cache/index');

const getImagesByOwnerId = async (id, start, limit) => {
  try {
    const cacheKey = RedisKeys.getImagesByOwnerIdKey(id, start, limit);
    
    return await cacheHelper.getOrSet(cacheKey, async () => {
      return await getDataWithLimit(IMAGES_MODEL, { ownerId: id }, 'updated_at', start, limit);
    }, RedisTTL.IMAGE_LIST_BY_OWNER_ID);
  } catch (error) {
    console.error('Error in createUsers:', error);
    throw error;
  }
};

const countImagesByOwnerId = async (ownerId) => {
  try {
    const cacheKey = RedisKeys.getCountImagesByOwnerIdKey(ownerId);

    return await cacheHelper.getOrSet(cacheKey, async () => {
      return await countDocuments(IMAGES_MODEL, { ownerId });
    }, RedisTTL.IMAGE_COUNT_BY_OWNER_ID);
  } catch (error) {
    console.error('Error in createUsers:', error);
    throw error;
  }
};

module.exports = {
  getImagesByOwnerId,
  countImagesByOwnerId
};
