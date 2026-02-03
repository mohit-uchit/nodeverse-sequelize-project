'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model { }
  Todo.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      category_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id',
        },
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
      modelName: 'Todo',
      tableName: 'todos',
      paranoid: true, // Enable soft delete
      timestamps: true, // Enable timestamps
      underscored: true, // Use snake_case for column names,
      deletedAt: 'deleted_at',
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    },
  );

  Todo.associate = models => {
    Todo.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    })
    Todo.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    })
    Todo.belongsToMany(models.Tag, {
      through: 'TodoTags',
      foreignKey: 'todo_id',
      otherKey: 'tag_id',
      as: 'tags'
    })
  };

  return Todo;
};
