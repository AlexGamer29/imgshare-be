'use strict';
const { TOKENS_MODEL } = require('../../constants/modelName.constant');

module.exports = (sequelize, DataTypes) => {
  const Tokens = sequelize.define(
    TOKENS_MODEL,
    {
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: DataTypes.STRING(1000),
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
      tableName: TOKENS_MODEL.toLowerCase(),
      timestamps: false,
      underscored: true,
      hooks: {
        beforeUpdate: (token, options) => {
          token.updateAt = new Date();
        },
      },
    }
  );
  return Tokens;
};
