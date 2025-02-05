import { Model, DataTypes } from 'sequelize';
import sequelizeInit from '../config/sequelize';
import { v4 as uuidv4 } from 'uuid';

class User extends Model {
  public user_id!: string;
  public select_region!: string;
  public first_name!: string;
  public last_name!: string;
  public date_of_birth!: Date;
  public phone_number!: string;
  public email!: string;
  public password!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    select_region: {
      type: DataTypes.STRING,

      allowNull: false,

    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^[+]?[0-9]{10,15}$/,
          msg: 'Invalid phone number format.',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Invalid email format.',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8, 128],
          msg: 'Password must be between 8 and 128 characters.',
        },
      },
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

export default User;
