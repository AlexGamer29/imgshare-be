'use strict';
const { IMAGES_MODEL } = require('../../constants/modelName.constant');

module.exports = (sequelize, DataTypes) => {
  const Images = sequelize.define(
    IMAGES_MODEL,
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      ownerId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        index: true,
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      storageClass: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      etag: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      acl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bucket: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: IMAGES_MODEL.toLowerCase(),
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['owner_id'], // Ensure index is created
        },
      ],
    }
  );
  return Images;
};
