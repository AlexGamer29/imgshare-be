const { encrypt, decrypt } = require('../../helpers/rsa.helper');

const encryptData = async (req, res) => {
  const { data } = req.body;
  try {
    const encryptedData = encrypt(data);
    return res.json({
      data: encryptedData,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        message: error,
      },
    });
    console.error(error);
  }
};

const decryptData = async (req, res) => {
  const { data } = req.body;
  try {
    const decryptedData = decrypt(data);
    return res.json({
      data: decryptedData,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        message: error,
      },
    });
    console.error(error);
  }
};

module.exports = {
  encryptData,
  decryptData,
};
