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
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  AWS_REGION: process.env.AWS_REGION,
};
