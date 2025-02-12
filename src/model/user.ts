import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid'; //
import sequelize from '../config/database';

class User extends Model {
  public id!: string;
  public email!: string;
  public password!: string;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4(),
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
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
  },
);

const createUserTable = async () => {
  try {
    await sequelize.query(`
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
    console.log('error creating table', e);
  }
};

export { User, createUserTable };
