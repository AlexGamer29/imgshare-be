const authenticatePasetoToken = require('./token-verification/token-verification.middleware');
const { unknownEndpoint } = require('./common/common.middleware');

module.exports = {
  authenticatePasetoToken,
  unknownEndpoint,
};
