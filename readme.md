# Sequelize ORM - Complete Setup & Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Sequelize Initialization](#sequelize-initialization)
3. [Configuration Files](#configuration-files)
4. [Database Models](#database-models)
5. [Associations & Relationships](#associations--relationships)
6. [Database Design](#database-design)
7. [Migrations](#migrations)
8. [Running the Project](#running-the-project)

---

## Project Overview

This project uses **Sequelize ORM** (Object-Relational Mapping) with **MySQL** database to manage a Todo application with users, categories, and tags.

### Key Technologies:
- **Sequelize 6.37.7** - ORM for database operations
- **MySQL** - Relational database
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework (included in dependencies)

---

## Sequelize Initialization

### What is Sequelize?

Sequelize is a promise-based ORM for Node.js that supports multiple databases (MySQL, PostgreSQL, SQLite, MSSQL). It provides:
- Database abstraction layer
- Model definition and validation
- Query building and execution
- Relationships and associations
- Database migrations

### Installation

```bash
# Install Sequelize and MySQL driver
npm install sequelize mysql2

# Install Sequelize CLI for migrations
npm install --save-dev sequelize-cli
```

### Project Structure

```
project-root/
├── config/
│   └── database.js           # Database configuration
├── models/
│   ├── index.js              # Model loader & sequelize instance
│   ├── users/
│   │   └── user.js           # User model
│   └── todo/
│       ├── todo.js           # Todo model
│       ├── category.js       # Category model
│       └── tag.js            # Tag model
├── migrations/               # Database schema changes
│   ├── 20260203000001-create-users.js
│   ├── 20260203000002-create-categories.js
│   ├── 20260203000003-create-tags.js
│   ├── 20260203000004-create-todos.js
│   └── 20260203000005-create-todo-tags.js
├── .sequelizerc               # Sequelize CLI configuration
├── .env                       # Environment variables
├── server.js                  # Entry point
└── package.json               # Dependencies

```

---

## Configuration Files

### 1. `.sequelizerc` - Sequelize CLI Configuration

**Location:** Project root directory

```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('config', 'database.js'),
  'models-path': path.resolve('models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations'),
};
```

**Line-by-line Explanation:**

```javascript
// Import Node's path module for cross-platform file paths
const path = require('path');

// Export configuration object
module.exports = {
  // 'config': Points to database configuration file
  // Sequelize CLI uses this to connect to the database
  // path.resolve() creates absolute path from relative path
  'config': path.resolve('config', 'database.js'),
  
  // 'models-path': Directory where Sequelize models are stored
  // Sequelize auto-loads models from this directory
  'models-path': path.resolve('models'),
  
  // 'seeders-path': Directory for database seeders (test data)
  // Used for populating database with initial data
  'seeders-path': path.resolve('seeders'),
  
  // 'migrations-path': Directory for database migrations
  // Migrations are SQL scripts that define schema changes
  'migrations-path': path.resolve('migrations'),
};
```

**Why Use `.sequelizerc`?**
- Standardizes project structure
- Allows Sequelize CLI to find configuration and models
- Enables running migrations without manual configuration

---

### 2. `config/database.js` - Database Configuration

**Purpose:** Define database connection settings for different environments

```javascript
// Load environment variables from .env file
require('dotenv').config();

module.exports = {
  // ========================================
  // DEVELOPMENT ENVIRONMENT CONFIGURATION
  // ========================================
  development: {
    // Database username
    // Read from .env file: DB_USERNAME=root
    username: process.env.DB_USERNAME,
    
    // Database password
    // Read from .env file: DB_PASSWORD=ms999666ms
    password: process.env.DB_PASSWORD,
    
    // Database name (schema)
    // Read from .env file: DB_NAME=nodeverse
    database: process.env.DB_NAME,
    
    // Host/Server address
    // Read from .env file: DB_HOSTNAME=localhost
    host: process.env.DB_HOSTNAME,
    
    // Database dialect (type)
    // Sequelize supports: mysql, postgres, sqlite, mssql
    dialect: 'mysql',
  },

  // ========================================
  // TEST ENVIRONMENT CONFIGURATION
  // ========================================
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql',
    // Optional: Use separate test database
    // database: 'nodeverse_test',
  },

  // ========================================
  // PRODUCTION ENVIRONMENT CONFIGURATION
  // ========================================
  production: {
    // Production database credentials
    // Use separate prod environment variables for security
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    dialect: 'mysql',
    
    // Disable query logging in production (performance)
    logging: false,
    
    // Connection pool configuration
    // Maintains 'max' connections in pool for better performance
    pool: { max: 20 },
  },
};
```

**Usage in Code:**

```javascript
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('./config/database')[env];
// Selects appropriate config based on NODE_ENV
```

**Environment Variables (.env file):**

```dotenv
# Database Configuration
DB_USERNAME=root              # MySQL root user
DB_PASSWORD=ms999666ms        # MySQL password
DB_NAME=nodeverse             # Database/schema name
DB_HOSTNAME=localhost         # Server address (local or remote)
NODE_ENV=development          # Current environment

# Production (Optional)
PROD_DB_USERNAME=prod_user
PROD_DB_PASSWORD=prod_password
PROD_DB_NAME=nodeverse_prod
PROD_DB_HOSTNAME=prod-server.com
```

---

## Database Models

### 3. `models/index.js` - Model Loader & Sequelize Instance

**Purpose:** Initialize Sequelize connection and load all models

```javascript
'use strict';

// Core modules
// fs: File System - Read directory contents
const fs = require('fs');
// path: Path utilities - Handle file paths cross-platform
const path = require('path');

// Sequelize ORM
// Import the Sequelize constructor function
const sequelizeLib = require('sequelize');

// Get current filename for filtering
// Used to exclude index.js from model loading
const basename = path.basename(__filename);

// Get environment (development, test, production)
// Default to 'development' if NODE_ENV not set
const env = process.env.NODE_ENV || 'development';

// Load database configuration for current environment
// Returns object with username, password, database, host, dialect
const dbConfig = require('../config/database')[env];

// Object to store all loaded models
// Keys: Model name (User, Todo, Category, Tag)
// Values: Model class definitions
const db = {};

// ========================================
// STEP 1: CREATE SEQUELIZE INSTANCE
// ========================================

// Initialize Sequelize connection with configuration
let sequelize = new sequelizeLib(
  dbConfig.database,    // Database name
  dbConfig.username,    // MySQL username
  dbConfig.password,    // MySQL password
  dbConfig,             // Additional options (host, dialect, etc.)
);

// ========================================
// STEP 2: DEFINE MODEL LOADING FUNCTION
// ========================================

function loadModels(directory) {
  // Read all files in specified directory
  fs.readdirSync(directory)
    // Filter files to only include model files
    .filter(file => {
      return (
        // Exclude hidden files (starting with .)
        file.indexOf('.') !== 0 &&
        // Exclude the index.js file itself
        file !== basename &&
        // Only include .js files
        file.slice(-3) === '.js' &&
        // Exclude test files
        file.indexOf('.test.js') === -1
      );
    })
    // For each valid model file
    .forEach(file => {
      // Require (import) the model file
      // Each model file exports a function(sequelize, DataTypes)
      const model = require(path.join(directory, file))(
        sequelize,              // Sequelize instance for queries
        sequelizeLib.DataTypes, // Data types (STRING, INTEGER, etc.)
      );
      
      // Store model in db object
      // Key: Model name (extracted from model.name)
      // Example: db['User'] = User model class
      db[model.name] = model;
    });
}

// ========================================
// STEP 3: LOAD ALL MODELS
// ========================================

// Load models from root models directory
// Loads any model files directly in models/
loadModels(__dirname);

// Load models from todo subdirectory
// Loads: todo.js, category.js, tag.js
// Please sort in A->Z order when you add a new path!
loadModels(__dirname + '/todo');

// Load models from users subdirectory
// Loads: user.js
// Please sort in A->Z order when you add a new path!
loadModels(__dirname + '/users');

// ========================================
// STEP 4: SETUP ASSOCIATIONS (Relationships)
// ========================================

// For each loaded model
Object.keys(db).forEach(modelName => {
  // Check if model defines an associate function
  // Each model's associate function sets up relationships
  if (db[modelName].associate) {
    // Call the associate function, passing all models
    // This allows models to reference other models
    db[modelName].associate(db);
  }
});

// ========================================
// STEP 5: EXPORT SEQUELIZE INSTANCE & MODELS
// ========================================

// Add Sequelize instance to exports
// Allows other files to access db.sequelize for queries
db.sequelize = sequelize;

// Add Sequelize library to exports
// Allows other files to use DataTypes, etc.
db.sequelizeLib = sequelizeLib;

// Export everything
// Usage in other files: const db = require('./models');
module.exports = db;
```

**Key Concepts:**

```javascript
// How models are loaded:
// 1. fs.readdirSync() reads directory
// 2. filter() selects only valid .js files
// 3. forEach() requires each model file
// 4. Model file returns function: (sequelize, DataTypes) => {}
// 5. This function initializes and returns model class
// 6. Model stored in db object

// Association setup:
// After all models loaded, associations run
// This allows models to reference each other
// Example: User.hasMany(Todo)
```

**Using Models in Other Files:**

```javascript
// In a route or controller file
const db = require('./models');

// Access models
const User = db.User;
const Todo = db.Todo;

// Use models for queries
const user = await User.findByPk(1);
const todos = await user.getTodos(); // Association method
```

---

### 4. Model Definitions

#### User Model (`models/users/user.js`)

```javascript
'use strict';
const { Model } = require('sequelize');

// Export function that defines the model
module.exports = (sequelize, DataTypes) => {
  // Create User class extending Sequelize Model
  class User extends Model {}
  
  // Initialize (define) the User model
  User.init(
    {
      // ========== COLUMN DEFINITIONS ==========
      
      // id: Primary Key
      id: {
        type: DataTypes.BIGINT.UNSIGNED,    // Large integer, unsigned (no negative)
        allowNull: false,                    // Cannot be NULL
        primaryKey: true,                    // Primary key constraint
        autoIncrement: true,                 // Auto-increment on insert
      },
      
      // email: User email (unique)
      email: {
        type: DataTypes.STRING(255),         // String up to 255 characters
        allowNull: false,                    // Required field
        unique: true,                        // Unique constraint
      },
      
      // password: User password (hashed)
      password: {
        type: DataTypes.STRING(255),         // String up to 255 characters
        allowNull: false,                    // Required field
        hidden: true,                        // Exclude from queries by default
      },
      
      // created_at: Record creation timestamp
      created_at: {
        type: 'TIMESTAMP',                   // Database TIMESTAMP type
        allowNull: false,                    // Required
      },
      
      // updated_at: Last update timestamp
      updated_at: {
        type: 'TIMESTAMP',                   // Database TIMESTAMP type
        allowNull: false,                    // Required
      },
      
      // deleted_at: Soft delete timestamp (NULL = not deleted)
      deleted_at: {
        type: 'TIMESTAMP',
        allowNull: true,                     // Nullable (NULL means active)
      },
    },
    
    // ========== MODEL OPTIONS ==========
    {
      sequelize,                             // Sequelize instance
      modelName: 'User',                     // Model name (singular)
      tableName: 'users',                    // Actual table name (plural)
      paranoid: true,                        // Enable soft deletes
      timestamps: true,                      // Auto-manage createdAt, updatedAt
      underscored: true,                     // Use snake_case for column names
      deletedAt: 'deleted_at',               // Column name for soft delete
      updatedAt: 'updated_at',               // Column name for update timestamp
      createdAt: 'created_at',               // Column name for create timestamp
      defaultScope: {
        attributes: {
          // Exclude these columns from default queries
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
      },
    },
  );

  // ========== ASSOCIATIONS ==========
  
  User.associate = models => {
    // User has many Todos
    User.hasMany(models.Todo, {
      foreignKey: 'user_id',                 // Foreign key in todos table
      as: 'todo',                            // Alias: user.getTodo() or user.todo
    });
  };

  return User;
};
```

**Column Types Explained:**

```javascript
// Numeric Types
DataTypes.BIGINT.UNSIGNED    // Large integer (0 to 18,446,744,073,709,551,615)
DataTypes.INTEGER            // Integer (-2,147,483,648 to 2,147,483,647)
DataTypes.SMALLINT           // Small integer (-32,768 to 32,767)
DataTypes.TINYINT            // Tiny integer (-128 to 127)

// String Types
DataTypes.STRING             // VARCHAR(255) by default
DataTypes.STRING(100)        // VARCHAR(100)
DataTypes.TEXT               // Large text field
DataTypes.CHAR(10)           // Fixed-length character

// Date/Time Types
DataTypes.DATE               // DATETIME
'TIMESTAMP'                  // TIMESTAMP (special - auto-updates)

// Boolean
DataTypes.BOOLEAN            // TINYINT(1) in MySQL

// JSON
DataTypes.JSON               // JSON type
```

#### Todo Model (`models/todo/todo.js`)

```javascript
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {}
  
  Todo.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      
      // title: Todo task title
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      
      // completed: Task completion status
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,                 // Default: not completed
      },
      
      // ========== FOREIGN KEYS ==========
      
      // user_id: Reference to User who owns this Todo
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,                    // Must belong to a user
        references: {
          model: 'users',                    // Foreign table
          key: 'id',                         // Foreign column
        },
      },
      
      // category_id: Reference to Category
      category_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,                     // Optional category
        references: {
          model: 'categories',               // Foreign table
          key: 'id',                         // Foreign column
        },
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
      modelName: 'Todo',
      tableName: 'todos',
      paranoid: true,
      timestamps: true,
      underscored: true,
      deletedAt: 'deleted_at',
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    },
  );

  Todo.associate = models => {
    // Belongs to User (Many-to-One)
    Todo.belongsTo(models.User, {
      foreignKey: 'user_id',                 // This table's foreign key
      as: 'user',                            // Alias: todo.getUser(), todo.user
    });
    
    // Belongs to Category (Many-to-One)
    Todo.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category',                        // Alias: todo.getCategory(), todo.category
    });
    
    // Belongs to Many Tags (Many-to-Many)
    Todo.belongsToMany(models.Tag, {
      through: 'TodoTags',                   // Junction table
      foreignKey: 'todo_id',                 // This table's FK in junction
      otherKey: 'tag_id',                    // Other table's FK in junction
      as: 'tags',                            // Alias: todo.getTags(), todo.tags
    });
  };

  return Todo;
};
```

#### Category Model (`models/todo/category.js`)

```javascript
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {}
  
  Category.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      
      // name: Category name
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
      modelName: 'Category',
      tableName: 'categories',
      paranoid: true,
      timestamps: true,
      underscored: true,
      deletedAt: 'deleted_at',
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    },
  );

  Category.associate = models => {
    // Has many Todos (One-to-Many)
    Category.hasMany(models.Todo, {
      foreignKey: 'category_id',             // Foreign key in todos
      as: 'todos',                           // Alias: category.getTodos(), category.todos
    });
  };

  return Category;
};
```

#### Tag Model (`models/todo/tag.js`)

```javascript
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {}
  
  Tag.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      
      // name: Tag label
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
      paranoid: true,
      timestamps: true,
      underscored: true,
      deletedAt: 'deleted_at',
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    },
  );

  Tag.associate = models => {
    // Belongs to Many Todos (Many-to-Many)
    Tag.belongsToMany(models.Todo, {
      through: 'TodoTags',                   // Junction table
      foreignKey: 'tag_id',                  // This table's FK
      otherKey: 'todo_id',                   // Other table's FK
      as: 'todos',                           // Alias: tag.getTodos(), tag.todos
    });
  };

  return Tag;
};
```

---

## Associations & Relationships

### Understanding Associations

Associations define how models relate to each other in the database.

#### 1. **One-to-Many (hasMany / belongsTo)**

**Example: User → Todo**

One user can have multiple todos, but each todo belongs to one user.

```javascript
// In User model
User.associate = models => {
  User.hasMany(models.Todo, {
    foreignKey: 'user_id',    // Foreign key in todos table
    as: 'todo',               // Alias for accessing
  });
};

// In Todo model
Todo.associate = models => {
  Todo.belongsTo(models.User, {
    foreignKey: 'user_id',    // This model has the foreign key
    as: 'user',               // Alias for accessing
  });
};
```

**Usage:**

```javascript
// Get user with all todos
const user = await db.User.findByPk(1, {
  include: {
    association: 'todo',      // Use alias
    model: db.Todo,
  },
});

// Access todos through alias
user.todo;                      // Array of Todo objects

// Create todo for user
const todo = await user.createTodo({
  title: 'Buy groceries',
});

// Get all todos of a user
const todos = await user.getTodos();

// Add existing todo to user
await user.addTodo(todoId);
```

#### 2. **Many-to-Many (belongsToMany)**

**Example: Todo ↔ Tag**

Multiple todos can have multiple tags, and multiple tags can be applied to multiple todos.

```javascript
// In Todo model
Todo.associate = models => {
  Todo.belongsToMany(models.Tag, {
    through: 'TodoTags',        // Junction table
    foreignKey: 'todo_id',      // This model's FK
    otherKey: 'tag_id',         // Other model's FK
    as: 'tags',                 // Alias
  });
};

// In Tag model
Tag.associate = models => {
  Tag.belongsToMany(models.Todo, {
    through: 'TodoTags',        // Junction table
    foreignKey: 'tag_id',       // This model's FK
    otherKey: 'todo_id',        // Other model's FK
    as: 'todos',                // Alias
  });
};
```

**Junction Table (TodoTags):**

```
TodoTags table:
┌────┬─────────┬────────┐
│ id │ todo_id │ tag_id │
├────┼─────────┼────────┤
│ 1  │ 5       │ 2      │
│ 2  │ 5       │ 7      │
│ 3  │ 6       │ 2      │
└────┴─────────┴────────┘

Represents:
- Todo 5 has Tags 2 and 7
- Todo 6 has Tag 2
- Tag 2 is used by Todos 5 and 6
```

**Usage:**

```javascript
// Get todo with all tags
const todo = await db.Todo.findByPk(5, {
  include: {
    association: 'tags',
    model: db.Tag,
    through: { attributes: [] }, // Exclude junction table columns
  },
});

// Access tags
todo.tags;                          // Array of Tag objects

// Create association
await todo.addTag(tagId);           // Add existing tag
await todo.setTags([tag1, tag2]);   // Set all tags

// Create tag and associate
const tag = await todo.createTag({ name: 'Important' });

// Get associated tags
const tags = await todo.getTags();

// Remove association
await todo.removeTag(tagId);        // Remove one tag
await todo.removeTags();            // Remove all tags
```

#### 3. **Aliases**

Aliases provide custom names for accessing associations.

```javascript
// Model definition
User.hasMany(models.Todo, {
  foreignKey: 'user_id',
  as: 'todos',                  // Alias = 'todos'
});

// Usage
const user = await db.User.findByPk(1, {
  include: { association: 'todos' }, // Use alias
});

// Automatic methods created:
user.getTodos();                // Get associated todos
user.setTodos([...]);           // Set todos
user.addTodo(todo);             // Add single todo
user.createTodo({...});         // Create and associate
user.removeTodo(todo);          // Remove association
user.hasTodo(todo);             // Check association
user.countTodos();              // Count associated todos
```

#### 4. **Foreign Keys**

Foreign keys maintain referential integrity.

```javascript
// In todo table, user_id is foreign key
{
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    references: {
      model: 'users',           // References users table
      key: 'id',                // References id column
    },
    onDelete: 'CASCADE',         // Delete todos if user deleted
    onUpdate: 'CASCADE',         // Update todos if user id changes
  }
}

// Options:
// CASCADE: Delete/update dependent records
// SET NULL: Set FK to NULL when parent deleted
// RESTRICT: Prevent deletion of parent record
// NO ACTION: Similar to RESTRICT
```

---

## Database Design

### Entity Relationship Diagram (ERD)

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │
│ email        │◄────┐
│ password     │     │
│ created_at   │     │
│ updated_at   │     │ 1:N
│ deleted_at   │     │
└──────────────┘     │
                     │
                     │
┌──────────────────────────┐
│        todos             │
├──────────────────────────┤
│ id (PK)                  │
│ title                    │
│ completed                │
│ user_id (FK) ───────────►│
│ category_id (FK) ─────┐  │
│ created_at             │  │
│ updated_at             │  │
│ deleted_at             │  │
└──────────────────────────┘  │ 1:N
       │              │       │
       │ N:M          │       │
       │              │       │
       │         ┌──────────────┐
       │         │  categories  │
       │         ├──────────────┤
       │         │ id (PK)      │
       │         │ name         │
       │         │ created_at   │
       │         │ updated_at   │
       │         │ deleted_at   │
       │         └──────────────┘
       │
       │ Junction Table
       │
┌─────────────────┐
│    TodoTags     │
├─────────────────┤
│ id (PK)         │
│ todo_id (FK)    │
│ tag_id (FK)     │
│ created_at      │
│ updated_at      │
└─────────────────┘
       │
       │
┌──────────────┐
│     tags     │
├──────────────┤
│ id (PK)      │
│ name         │
│ created_at   │
│ updated_at   │
│ deleted_at   │
└──────────────┘
```

### Table Schemas

#### `users` Table

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `categories` Table

```sql
CREATE TABLE categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `tags` Table

```sql
CREATE TABLE tags (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `todos` Table

```sql
CREATE TABLE todos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false,
  user_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `TodoTags` Table (Junction/Bridge Table)

```sql
CREATE TABLE TodoTags (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  todo_id BIGINT UNSIGNED NOT NULL,
  tag_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE ON UPDATE CASCADE,
  
  UNIQUE KEY unique_todo_tag (todo_id, tag_id),
  INDEX idx_todo_id (todo_id),
  INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Migrations

### What are Migrations?

Migrations are version-controlled scripts that define database schema changes. They allow you to:
- Track database evolution over time
- Easily rollback changes
- Maintain consistent database across environments
- Collaborate with team on schema changes

### Running Migrations

```bash
# Run all pending migrations
npx sequelize db:migrate

# Undo last migration
npx sequelize db:migrate:undo

# Undo all migrations
npx sequelize db:migrate:undo:all

# Create new migration
npx sequelize migration:generate --name migration-name
```

### Migration Structure

```javascript
module.exports = {
  // Up: Defines what to do when migrating forward
  up: async (queryInterface, Sequelize) => {
    // Create tables, add columns, create indexes
    await queryInterface.createTable('users', {
      id: { ... },
      email: { ... },
      // ...
    });
  },

  // Down: Defines what to do when rolling back
  down: async (queryInterface, Sequelize) => {
    // Drop tables, remove columns, drop indexes
    await queryInterface.dropTable('users');
  },
};
```

---

## Running the Project

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with database credentials
cp .env.example .env

# 3. Edit .env with your database info
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=nodeverse
DB_HOSTNAME=localhost

# 4. Ensure MySQL is running
mysql.server start          # macOS
sudo systemctl start mysql  # Linux

# 5. Create database
mysql -u root -p
> CREATE DATABASE nodeverse;
> EXIT;

# 6. Run migrations
npx sequelize db:migrate

# 7. Start the server
npm start
```

### Using Models in Your Code

```javascript
// Import models
const db = require('./models');

// Use in route handlers
app.get('/users/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      include: {
        association: 'todo',
        model: db.Todo,
        include: {
          association: 'tags',
          model: db.Tag,
          through: { attributes: [] },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Query Examples

```javascript
// Find all users
const users = await db.User.findAll();

// Find user by primary key
const user = await db.User.findByPk(1);

// Find user with todos
const user = await db.User.findByPk(1, {
  include: { association: 'todo' },
});

// Find todos with category and tags
const todos = await db.Todo.findAll({
  include: [
    { association: 'category' },
    { association: 'user' },
    { association: 'tags', through: { attributes: [] } },
  ],
});

// Create user
const user = await db.User.create({
  email: 'user@example.com',
  password: 'hashedPassword',
});

// Create todo for user
const todo = await user.createTodo({
  title: 'Buy milk',
  category_id: 1,
});

// Add tags to todo
await todo.addTag(1);
await todo.addTag(2);

// Update
await user.update({ email: 'newemail@example.com' });

// Delete (soft delete with paranoid: true)
await user.destroy();

// Find including deleted
const user = await db.User.findByPk(1, { paranoid: false });

// Restore
await user.restore();
```

---

## Best Practices

### 1. **Use Aliases for Clarity**

```javascript
// Good - Clear what association we're using
User.hasMany(models.Todo, {
  as: 'todos',
  foreignKey: 'user_id',
});

// Usage: user.getTodos()

// Bad - Generic names
User.hasMany(models.Todo);
```

### 2. **Specify Foreign Keys Explicitly**

```javascript
// Good - Explicit
Todo.belongsTo(models.User, {
  foreignKey: 'user_id',
});

// Avoid - Implicit (Sequelize guesses, can be unpredictable)
Todo.belongsTo(models.User);
```

### 3. **Use Soft Deletes for Data Preservation**

```javascript
paranoid: true,            // Enable soft deletes
deletedAt: 'deleted_at',  // Column for deletion timestamp
```

### 4. **Add Indexes for Performance**

```javascript
// In migration
await queryInterface.addIndex('todos', ['user_id']);
await queryInterface.addIndex('todos', ['category_id']);
```

### 5. **Use Transactions for Multiple Operations**

```javascript
const transaction = await db.sequelize.transaction();

try {
  const user = await db.User.create({ ... }, { transaction });
  const todo = await db.Todo.create({ ... }, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### 6. **Validate Data at Model Level**

```javascript
name: {
  type: DataTypes.STRING,
  allowNull: false,
  validate: {
    notNull: { msg: 'Name is required' },
    len: {
      args: [1, 100],
      msg: 'Name must be between 1 and 100 characters',
    },
  },
}
```

---

## Troubleshooting

### "Please install mysql2 package manually"
```bash
npm install mysql2
```

### "Cannot find module '.sequelizerc'"
```bash
# Make sure .sequelizerc exists in project root
# Check file path in .sequelizerc matches your project structure
```

### "getaddrinfo ENOTFOUND localhost"
```bash
# MySQL not running or wrong host
# Start MySQL: mysql.server start (macOS)
# Check DB_HOSTNAME in .env
```

### "ER_NO_DB_ERROR: No database selected"
```bash
# Database doesn't exist
# Create it: CREATE DATABASE nodeverse;
# Or update DB_NAME in .env
```

### "ER_ACCESS_DENIED_ERROR: Access denied"
```bash
# Wrong credentials in .env
# Verify DB_USERNAME and DB_PASSWORD
```

---

## Summary

This Sequelize setup provides:

✅ **Organized Structure** - Clear separation of concerns  
✅ **Database Abstraction** - Easy to switch databases  
✅ **Relationships** - Proper associations between models  
✅ **Migrations** - Version-controlled schema changes  
✅ **Soft Deletes** - Data preservation without hard deletion  
✅ **Validation** - Data integrity at model level  
✅ **Performance** - Proper indexes and query optimization  

The configuration allows scaling from development to production with minimal changes, supporting multiple environments and team collaboration.
