const bcrypt = require('bcryptjs');

const { createUsers, findEmailExist } = require('../../services/accounts');
const { decrypt } = require('../../helpers/rsa.helper');
const {
  generateTokens,
  verifyRefreshToken,
} = require('../../helpers/tokens.helper');
const { findOne, deleteDocument } = require('../../helpers/query.helper');
const { stringToNumber } = require('../../helpers/general.helper');
const { translateMessage } = require('../../helpers/translation.helper');
const Joi = require('joi');

const signUpSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
  username: Joi.string().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
});

const logInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
});

const signUpWithPassword = async (req, res) => {
  const { language } = req.query;
  const { email, password, firstname, lastname, username } = req.body;
  try {
    const decryptedPassword = decrypt(password);

    // Validate request body with the decrypted password
    const validate = await signUpSchema.validateAsync({
      ...req.body,
      password: decryptedPassword,
    });

    // Proceed to create user account if validation is successful
    const hashedPassword = bcrypt.hashSync(
      decryptedPassword,
      bcrypt.genSaltSync(10)
    );
    // Create new user
    const user = await createUsers(
      email,
      hashedPassword,
      null,
      null,
      null,
      'local',
      firstname,
      lastname,
      username
    );
    // Remove password from the user object before returning
    user.dataValues.password = undefined;

    // Return success response
    return res.json({
      data: { user },
      error: null,
    });
  } catch (error) {
    console.error(error);

    // Return error response
    res.status(500).json({
      data: null,
      error: {
        message: `${error?.name}: ${error?.message}`,
        code: parseInt(error?.parent?.code) || 500,
      },
    });
  }
};

const logInWithPassword = async (req, res) => {
  const { language } = req.query;
  const { email, password } = req.body;
  try {
    const decryptedPassword = decrypt(password);
    const validate = await logInSchema.validateAsync({
      ...req.body,
      password: decryptedPassword,
    });

    const populatedUser = await findEmailExist(email);
    const user = populatedUser[0]?.dataValues;
    if (user) {
      const passwordIsValid = bcrypt.compareSync(
        decryptedPassword,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          data: null,
          error: {
            message: 'Invalid email or password',

            code: stringToNumber('Invalid email or password'),
          },
        });
      }
      user.password = undefined;
      const { accessToken, refreshToken } = await generateTokens(user);
      res.status(200).send({
        data: {
          accessToken,
          refreshToken,
        },
        error: null,
      });
    } else {
      return res.status(403).send({
        data: null,
        error: {
          message: 'User not found',
          code: stringToNumber('User not found'),
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      data: null,
      error: {
        message: `${error?.name}: ${error?.message}`,
        code: parseInt(error?.parent?.code) || 500,
      },
    });
  }
};

const getAccessToken = async (req, res) => {
  const { language } = req.query;
  const { refreshToken } = req.body;
  try {
    verifyRefreshToken(refreshToken)
      .then(async ({ user }) => {
        const { accessToken, refreshToken: newRefreshToken } =
          await generateTokens(user);
        return res.status(200).send({
          data: {
            accessToken,
            refreshToken: newRefreshToken,
          },
          error: null,
        });
      })
      .catch(async error => {
        console.log(error);
        return res.status(403).send(error);
      });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        message: error?.name + ': ' + error?.message,
        code: parseInt(error?.parent?.code) || 500,
      },
    });
    console.error(error);
  }
};

const deleteRefreshToken = async (req, res) => {
  const { language } = req.query;
  const { refreshToken } = req.body;
  try {
    const refreshTokenDB = await findOne('tokens', { token: refreshToken });

    if (!refreshTokenDB) {
      return res.status(404).send({
        data: null,
        error: {
          message: await translateMessage(
            'Token does not exist or has already been removed',
            language
          ),
          code: stringToNumber(
            'Token does not exist or has already been removed'
          ),
        },
      });
    }

    await deleteDocument('tokens', { token: refreshToken });
    return res.status(200).json({
      data: {
        message: await translateMessage('Logged out successfully', language),
      },
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        message: error?.name + ': ' + error?.message,
        code: parseInt(error?.parent?.code) || 500,
      },
    });
    console.error(error);
  }
};

module.exports = {
  signUpWithPassword,
  logInWithPassword,
  getAccessToken,
  deleteRefreshToken,
};
