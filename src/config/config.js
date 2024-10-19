require('dotenv').config();

module.exports = {
  APP_NAME: process.env.APP_NAME,
  PORT: process.env.PORT,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DB: process.env.POSTGRES_DB,
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  RSA_PUBLIC_KEY: process.env.RSA_PUBLIC_KEY,
  RSA_PRIVATE_KEY: process.env.RSA_PRIVATE_KEY,
  PASETO_PUBLIC_KEY: process.env.PASETO_PUBLIC_KEY,
  PASETO_PRIVATE_KEY: process.env.PASETO_PRIVATE_KEY,
  API_VERSION: process.env.API_VERSION,
};
