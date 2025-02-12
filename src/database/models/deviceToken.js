'use strict';
const {
  DEVICE_TOKEN_MODEL,
} = require('../../constants/modelName.constant');

module.exports = (sequelize, DataTypes) => {
  const DeviceToken = sequelize.define(
    DEVICE_TOKEN_MODEL,
    {
      accountId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      deviceType: DataTypes.STRING,
      deviceToken: DataTypes.STRING,
      deviceId: DataTypes.STRING,
      deviceName: DataTypes.STRING,
      appVersion: DataTypes.STRING,
    },
    {
      tableName: DEVICE_TOKEN_MODEL.toLowerCase(),
      timestamps: false,
      underscored: true,
    }
  );
  return DeviceToken;
};
