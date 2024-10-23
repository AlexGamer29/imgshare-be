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

const updateUsers = async (id, updates) => {
  try {
    const now = new Date();

    // Destructure the updates object to get potential new values
    const { email, password, firstname, lastname, username } = updates;

    // Fetch only the lastchange object for the user
    const userRecord = await models.users.findOne({
      where: { id },
      attributes: ['lastchange'],
    });

    if (!userRecord) {
      throw new Error('User not found');
    }

    // Merge the current lastchange values with the new ones
    const lastchange = userRecord.lastchange || {};

    const fieldsToUpdate = {};

    if (email && email.trim() !== '') {
      fieldsToUpdate.email = email;
      lastchange.email = now; // Update lastchange for email
    }

    if (password && password.trim() !== '') {
      fieldsToUpdate.password = password; // Hash the password before saving
      lastchange.password = now; // Update lastchange for password
    }

    if (firstname && firstname.trim() !== '') {
      fieldsToUpdate.firstname = firstname;
      lastchange.firstname = now; // Update lastchange for firstname
    }

    if (lastname && lastname.trim() !== '') {
      fieldsToUpdate.lastname = lastname;
      lastchange.lastname = now; // Update lastchange for lastname
    }

    if (username && username.trim() !== '') {
      fieldsToUpdate.username = username;
      lastchange.username = now; // Update lastchange for username
    }

    // Include lastchange in the update
    fieldsToUpdate.lastchange = lastchange;

    // Check if there's anything to update
    if (Object.keys(fieldsToUpdate).length === 0) {
      throw new Error('No valid fields to update');
    }

    // Perform the update operation
    const [affectedCount, affectedRows] = await models.users.update(
      fieldsToUpdate,
      {
        where: { id },
        returning: true, // Return the updated instance
      }
    );

    // Check if the user was found and updated
    if (affectedCount === 0) {
      throw new Error('User not found or no changes made');
    }

    // Return the updated user instance
    return affectedRows[0]; // Return the first updated user instance
  } catch (error) {
    console.error('Error in updateUsers:', error);
    throw error;
  }
};


module.exports = {
  createUsers,
  findEmailExist,
  updateUsers
};
