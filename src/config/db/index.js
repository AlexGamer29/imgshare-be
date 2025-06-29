require('dotenv').config();

module.exports = {
  development: {
    dialect: 'postgres',
    url: process.env.DEV_DATABASE_URL,
    host: process.env.DEV_DATABASE_HOST,
    username: process.env.DEV_DATABASE_USERNAME,
    password: process.env.DEV_DATABASE_PWD,
    database: process.env.DEV_DATABASE_NAME,
    port: process.env.DEV_DATABASE_PORT,
  },
  test: {
    dialect: 'postgres',
    url: process.env.TEST_DATABASE_URL,
    host: process.env.TEST_DATABASE_HOST,
    username: process.env.TEST_DATABASE_USERNAME,
    password: process.env.TEST_DATABASE_PWD,
    database: process.env.TEST_DATABASE_NAME,
    port: process.env.TEST_DATABASE_PORT,
  },
  staging: {
    dialect: 'postgres',
    host: process.env.STAGING_DATABASE_HOST,
    url: process.env.STAGING_DATABASE_URL,
    username: process.env.STAGING_DATABASE_USERNAME,
    password: process.env.STAGING_DATABASE_PWD,
    database: process.env.STAGING_DATABASE_NAME,
    port: process.env.STAGING_DATABASE_PORT,
  },
  production: {
    dialect: 'postgres',
    host: process.env.PRODUCTION_DATABASE_HOST,
    url: process.env.PRODUCTION_DATABASE_URL,
    username: process.env.PRODUCTION_DATABASE_USERNAME,
    password: process.env.PRODUCTION_DATABASE_PWD,
    database: process.env.PRODUCTION_DATABASE_NAME,
    port: process.env.PRODUCTION_DATABASE_PORT,
  },
};
