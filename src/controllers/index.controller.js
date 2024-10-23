const {
  signUpWithPassword,
  logInWithPassword,
  getAccessToken,
  deleteRefreshToken,
} = require('./auth/auth.controller');
const { getUserInfo, getAllUsers, createNewUser, updateUser } = require('./user/user.controller');
const { encryptData, decryptData } = require('./private/private.controller');
const { uploadImage } = require('./upload/upload.controller');
const { getAllImages } = require('./image/image.controller');

module.exports = {
  signUpWithPassword,
  logInWithPassword,
  getAccessToken,
  deleteRefreshToken,
  getUserInfo,
  encryptData,
  decryptData,
  getAllUsers,
  createNewUser,
  updateUser,
  uploadImage,
  getAllImages
};
