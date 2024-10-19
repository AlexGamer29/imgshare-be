const models = require('../../database/');

const createUsers = async (
  email,
  password,
  googleId,
  facebookId,
  appleId,
  firstname,
  lastname,
  username
) => {
  try {
    let users = await models.users.create({
      email: email,
      password: password,
      googleId: googleId,
      facebookId: facebookId,
      appleId: appleId,
      firstname: firstname,
      lastname: lastname,
      username: username,
    });
    return users;
  } catch (error) {
    throw error;
  }
};

const findEmailExist = async (email) => {
  try {
    const users = await models.users.findAll({
      where: {
        email: email,
      },
    });
    return users;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUsers,
  findEmailExist
};
