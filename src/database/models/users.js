'use strict';
const { USERS_MODEL } = require('../../constants/modelName.constant');

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    USERS_MODEL,
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING, // Nullable for OAuth users
      },
      googleId: {
        type: DataTypes.STRING, // Store Google ID for Google signups
      },
      facebookId: {
        type: DataTypes.STRING, // Store Facebook ID for Facebook signups
      },
      appleId: {
        type: DataTypes.STRING, // Store Apple ID for Apple signups
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      lastchange: {
        type: DataTypes.JSONB, // Tracks last change timestamps
        defaultValue: {
          firstname: null,
          lastname: null,
          username: null,
          password: null,
          email: null,
        },
      },
    },
    {
      tableName: USERS_MODEL.toLowerCase(),
      timestamps: true,
      underscored: true,
    }
  );
  return Users;
};
