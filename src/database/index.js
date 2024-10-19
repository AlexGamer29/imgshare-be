const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.js')[env];
const db = {};
config.logging = false;

const { accounts, tokens, users } = require('./models');

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(path.join(__dirname, 'models'))
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, 'models', file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Sync the models with the database
sequelize
  .sync({ force: false })
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch(err => {
    console.error('An error occurred while synchronizing the models:', err);
  });

db.sequelize = sequelize;
db.accounts = accounts(sequelize, Sequelize.DataTypes);
db.users = users(sequelize, Sequelize.DataTypes);
db.tokens = tokens(sequelize, Sequelize.DataTypes);

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log(
      'Connection to the database has been established successfully.'
    );
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = db;
