import { Model, DataTypes } from "sequelize";
import sequelizeInit from "../config/sequelize";
import User from "./user.model";
import { Payment } from "./payment.model";
import SosUserSubscription from "./sos_user_subscription.model";

class SosUser extends Model {
  public id!: string;
  public user_id!: string;
  public address!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SosUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: "sos_user",
    tableName: "sos_users",
    timestamps: true,
    underscored: true,
  }
);

export default SosUser;