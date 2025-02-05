import { DataTypes, Model } from 'sequelize';
import sequelizeInit from '../config/sequelize';

class User extends Model {
  public id!: number;
  public googleId!: string;
  public email!: string;
  public name!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInit,
    tableName: 'users',
  }
);

export default User;
