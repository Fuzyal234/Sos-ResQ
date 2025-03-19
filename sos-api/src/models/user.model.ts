import { Model, DataTypes, Optional } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";
import { Gender } from "../types/user";

interface UserAttributes {
  id: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: Date | null;
  phone_number: string | null;
  email: string;
  gender: Gender | null;
  role: string | null;
  password?: string;

  created_at?: Date;
  updated_at?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, "id"> { }

class User extends Model<UserAttributes, UserCreationAttributes> {}

 User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
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
    gender: {
      type: DataTypes.ENUM,
      values: Object.values(Gender),
      allowNull: true,
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
