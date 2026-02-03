'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {}
  User.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        hidden: true, // Mark the 'password' attribute as hidden
      },
      created_at: {
        type: 'TIMESTAMP',
        allowNull : false
      },
      updated_at: {
        type: 'TIMESTAMP',
        allowNull : false
      },
      deleted_at: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      paranoid: true, // Enable soft delete
      timestamps: true, // Enable timestamps
      underscored: true, // Use snake_case for column names,
      deletedAt: 'deleted_at',
      updatedAt: 'updated_at',
      createdAt: 'created_at',
      defaultScope: {
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'], // Exclude 'createdAt' and 'updatedAt'
        },
      },
    },
  );

  User.associate = models => {
      User.hasMany(models.Todo, { 
         foreignKey : "user_id",
         as : "todo"
      })
  };

  return User;
};
