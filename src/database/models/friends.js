'use strict';
const {
  FRIENDS_MODEL,
  USERS_MODEL,
} = require('../../constants/modelName.constant');

module.exports = (sequelize, DataTypes) => {
  const Friends = sequelize.define(
    FRIENDS_MODEL,
    {
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      friendId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      tableName: FRIENDS_MODEL.toLowerCase(),
      timestamps: false,
      underscored: true,
    }
  );

  Friends.associate = models => {
    Friends.belongsTo(models[USERS_MODEL], { as: USERS_MODEL.toLowerCase(), foreignKey: 'userId' });
    Friends.belongsTo(models[USERS_MODEL], {
      as: FRIENDS_MODEL.toLowerCase(),
      foreignKey: 'friendId',
    });
  };

  return Friends;
};
