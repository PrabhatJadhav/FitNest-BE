import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Otp extends Model {
  public id!: string;
  public userId!: string;
  public otp!: string;
  public expires_at!: number;
  public created_at!: number;
  public verified!: boolean;
}

Otp.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // ✅ Correct way
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.BIGINT,
      field: 'expires_at',
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.BIGINT,
      field: 'created_at',
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'otps',
    modelName: 'Otp',
    timestamps: false,
  },
);

const createUserOtpTable = async () => {
  try {
    await sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
      CREATE TABLE IF NOT EXISTS otps (
        otp VARCHAR(6) NOT NULL,
        expires_at BIGINT NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
      );
    `);
    console.log('Users Otp table created');
  } catch (e) {
    console.log('Error creating Otp table:', e);
  }
};

export { Otp, createUserOtpTable };

// CREATE TABLE otps (
//     id SERIAL PRIMARY KEY,
//     email VARCHAR(255) NOT NULL,
//     otp VARCHAR(6) NOT NULL,
//     expires_at BIGINT NOT NULL,
//     verified BOOLEAN DEFAULT FALSE,
//     created_at TIMESTAMP DEFAULT NOW()
// );
