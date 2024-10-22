const { createPaseto, verifyPaseto } = require('./paseto.helper');
const {
  findOne,
  insertNewDocument,
  deleteDocuments,
} = require('./query.helper');

const generateTokens = async user => {
  try {
    const accessToken = await createPaseto(user, '1h');
    const refreshToken = await createPaseto(user, '7d');
    const saveRefreshToken = await findOne('tokens', { userId: user.id });
    if (saveRefreshToken) await deleteDocuments('tokens', { userId: user.id });

    await insertNewDocument('tokens', {
      userId: user.id,
      token: refreshToken,
    });
    return Promise.resolve({ accessToken, refreshToken });
  } catch (error) {
    return Promise.reject(error);
  }
};

const verifyRefreshToken = refreshToken => {
  return new Promise(async (resolve, reject) => {
    const refreshTokenDB = await findOne('tokens', { token: refreshToken });
    if (!refreshTokenDB) {
      return reject({
        data: null,
        error: {
          code: 403,
          message: 'Invalid refresh token',
        },
      });
    }

    verifyPaseto(refreshToken).then(user => {
      if (!user) {
        return reject({
          data: null,
          error: {
            code: 402,
            message: 'Refresh token incorrect',
          },
        });
      }

      resolve({
        user,
        message: 'Valid refresh token',
      });
    });
  });
};

module.exports = { generateTokens, verifyRefreshToken };
