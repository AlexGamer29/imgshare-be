const { find } = require('../../helpers/query.helper');
const { createUsers, updateUsers } = require('../../services/users');

const createNewUser = async (req, res) => {
  const {
    email,
    password,
    googleId,
    facebookId,
    appleId,
    firstname,
    lastname,
    username,
  } = req.body;
  console.log(req.body);
  try {
    const user = await createUsers(
      email,
      password,
      googleId,
      facebookId,
      appleId,
      firstname,
      lastname,
      username
    );
    return res.json({
      data: { user },
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        message: error?.name + ': ' + error?.errors[0]?.message,
        code: parseInt(error?.code),
      },
    });
    console.error(error);
  }
};

const updateUser = async (req, res) => {
  console.log(req.body);
  try {
    const user = await updateUsers(1, req.body);
    return res.json({
      data: { user },
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        message: error?.name + ': ' + error?.errors[0]?.message,
        code: parseInt(error?.code),
      },
    });
    console.error(error);
  }
};

const getUserInfo = async (req, res) => {
  const user = req.user;
  try {
    user.iat = undefined;
    return res.json({
      data: { user },
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        message: error?.name + ': ' + error?.errors[0]?.message,
        code: parseInt(error?.code),
      },
    });
    console.error(error);
  }
};

const getAllUsers = async (req, res) => {
  const users = await find('accounts');
  try {
    return res.json({
      data: { users },
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        message: error?.name + ': ' + error?.errors[0]?.message,
        code: parseInt(error?.code),
      },
    });
    console.error(error);
  }
};

module.exports = {
  getUserInfo,
  getAllUsers,
  createNewUser,
  updateUser,
};
