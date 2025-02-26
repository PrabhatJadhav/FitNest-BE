import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { LifestyleType } from '../enums/lifestyle-enums';

class User extends Model {
  public id!: string;
  public email!: string;
  public password!: string;
  public lifestyle_type!: LifestyleType;
  public diet_type!: string;
  public total_sleep!: number;
  public eat_out!: number;
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
    lifestyle_type: {
      type: DataTypes.ENUM(...Object.values(LifestyleType)),
      allowNull: true,
    },
    diet_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_sleep: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eat_out: {
      type: DataTypes.STRING,
      allowNull: true,
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

const alterUserTable = async () => {
  try {
    await sequelize.query(`
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'lifestyle_enum'::regtype AND enumlabel = 'Moderate') THEN
      ALTER TYPE lifestyle_enum ADD VALUE 'Moderate';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'lifestyle_enum'::regtype AND enumlabel = 'Light') THEN
      ALTER TYPE lifestyle_enum ADD VALUE 'Light';
    END IF;
  END $$;
`);

    // // Step 1: Create ENUM type if not exists
    // await sequelize.query(`
    //   DO $$
    //   BEGIN
    //     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lifestyle_enum') THEN
    //       EXECUTE 'CREATE TYPE lifestyle_enum AS ENUM (''Sedentary'', ''Active'', ''Very Active'')';
    //     END IF;
    //   END $$;
    // `);

    // // Step 2: Alter table and add columns
    // await sequelize.query(`
    //   ALTER TABLE users
    //   ADD COLUMN IF NOT EXISTS lifestyle_type lifestyle_enum,
    //   ADD COLUMN IF NOT EXISTS diet_type VARCHAR(255),
    //   ADD COLUMN IF NOT EXISTS total_sleep INTEGER,
    //   ADD COLUMN IF NOT EXISTS eat_out INTEGER;
    // `);

    console.log('Users table altered successfully');
  } catch (error) {
    console.error('Error altering Users table:', error);
  }
};

export { User, createUserTable, alterUserTable };
