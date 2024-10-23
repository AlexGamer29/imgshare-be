const { find } = require('../../helpers/query.helper');
const { updateUsers } = require('../../services/users');

const updateUser = async (req, res) => {
  try {
    const user = await updateUsers(req?.user?.id, req.body);
    return res.json({
      data: { user },
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        message: error?.name + ': ' + error?.message,
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
  const users = await find('users');
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
  updateUser,
};
