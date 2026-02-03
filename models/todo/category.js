'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model { }
  Category.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_at: {
        type: 'TIMESTAMP',
        allowNull: false
      },
      updated_at: {
        type: 'TIMESTAMP',
        allowNull: false
      },
      deleted_at: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'categories',
      paranoid: true, // Enable soft delete
      timestamps: true, // Enable timestamps
      underscored: true, // Use snake_case for column names,
      deletedAt: 'deleted_at',
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    },
  );

  Category.associate = models => {
    Category.hasMany(models.Todo, {
      foreignKey: 'category_id',
      as: 'todos'
    })
  };

  return Category;
};
