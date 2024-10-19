'use strict';
const { ACCOUNTS_MODEL } = require('../../constants/modelName.constant');

module.exports = (sequelize, DataTypes) => {
  const Accounts = sequelize.define(
    ACCOUNTS_MODEL,
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updateAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: ACCOUNTS_MODEL.toLowerCase(),
      timestamps: false,
      underscored: true,
      hooks: {
        beforeUpdate: (account, options) => {
          account.updateAt = new Date();
        },
      },
    }
  );
  return Accounts;
};
