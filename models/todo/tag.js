'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model { }
  Tag.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: 'TIMESTAMP',
        allowNull: false,
      },
      updated_at: {
        type: 'TIMESTAMP',
        allowNull: false,
      },
      deleted_at: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Tag',
      tableName: 'tags',
      paranoid: true, // Enable soft delete
      timestamps: true, // Enable timestamps
      underscored: true, // Use snake_case for column names,
      deletedAt: 'deleted_at',
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    },
  );

  Tag.associate = models => {
    Tag.belongsToMany(models.Todo, {
      through: 'TodoTags',
      foreignKey: 'tag_id',
      otherKey: 'todo_id',
      as: 'todos'
    })
  };

  return Tag;
};
