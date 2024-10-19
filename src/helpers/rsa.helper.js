const JSEncrypt = require('node-jsencrypt');
const { RSA_PUBLIC_KEY, RSA_PRIVATE_KEY } = require('../config/config');

const publicKey = Buffer.from(RSA_PUBLIC_KEY, 'base64').toString('ascii');
const privateKey = Buffer.from(RSA_PRIVATE_KEY, 'base64').toString('ascii');

const jsEncrypt = new JSEncrypt();
jsEncrypt.setPublicKey(publicKey);
jsEncrypt.setPrivateKey(privateKey);

// Function to encrypt data
function encrypt(data) {
  return jsEncrypt.encrypt(data);
}

// Function to decrypt data
function decrypt(data) {
  return jsEncrypt.decrypt(data);
}

module.exports = { encrypt, decrypt };
