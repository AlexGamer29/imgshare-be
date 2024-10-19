const fs = require('fs');
const { V2 } = require('paseto');
const { sign, verify } = V2;
const { PASETO_PUBLIC_KEY, PASETO_PRIVATE_KEY } = require('../config/config');

// Load the private key
const privateKey = PASETO_PRIVATE_KEY;
// Load the public key
const publicKey = PASETO_PUBLIC_KEY;

// Creating a PASETO
async function createPaseto(payload, expiration = null) {
  const options = {
    footer: 'imgshare',
    issuedAt: true,
  };
  if (expiration) {
    options.expiresIn = expiration;
  }
  return await sign(payload, privateKey, options);
}

// Verifying a PASETO
async function verifyPaseto(token) {
  try {
    return await verify(token, publicKey);
  } catch (error) {
    console.log('*** 1111', error);
    throw error;
  }
}

module.exports = { createPaseto, verifyPaseto };
