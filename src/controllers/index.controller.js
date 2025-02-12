const {
  signUpWithPassword,
  logInWithPassword,
  getAccessToken,
  deleteRefreshToken,
} = require('./auth/auth.controller');
const {
  getUserInfo,
  getAllUsers,
  updateUser,
} = require('./user/user.controller');
const { encryptData, decryptData } = require('./private/private.controller');
const {
  getAllImages,
  uploadImage,
  deleteImage,
} = require('./image/image.controller');
const {
  addNewFriend,
  removeFriend,
  listAllFriends,
  searchFriends,
} = require('./friend/friend.controller');
const { getFeed } = require('./feed/feed.controller');

module.exports = {
  signUpWithPassword,
  logInWithPassword,
  getAccessToken,
  deleteRefreshToken,
  getUserInfo,
  encryptData,
  decryptData,
  getAllUsers,
  updateUser,
  uploadImage,
  deleteImage,
  getAllImages,
  addNewFriend,
  removeFriend,
  listAllFriends,
  searchFriends,
  getFeed,
};
