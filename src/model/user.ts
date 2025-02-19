import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  public id!: string;
  public email!: string;
  public password!: string;
  public created_at!: number;
  public updated_at!: number;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // ✅ Correct way
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.BIGINT,
      field: 'created_at',
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.BIGINT,
      field: 'updated_at',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: false,
  },
);

const createUserTable = async () => {
  try {
    await sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
        updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
      );
    `);
    console.log('Users table created');
  } catch (e) {
    console.log('Error creating table:', e);
  }
};

export { User, createUserTable };
