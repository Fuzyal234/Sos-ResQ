import { Model, DataTypes } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";

class User extends Model {
  public id!: string;
  public first_name!: string;
  public last_name!: string;
  public date_of_birth!: Date;
  public phone_number!: string;
  public email!: string;
  public role!: string;
  public password!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

const user = User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
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
          msg: "Invalid phone number format.",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Invalid email format.",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8, 128],
          msg: "Password must be between 8 and 128 characters.",
        },
      },
    },
    role: {
      type: DataTypes.ENUM("admin", "agent", "sos_user"),
      allowNull: false,
      defaultValue: "sos_user",
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

export default User;
