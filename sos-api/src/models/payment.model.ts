import { Model, DataTypes } from "sequelize";
import sequelizeInit from "../config/sequelize";
import User from "./user";
import SosUser from "./sos_user.model";
import { v4 as uuidv4 } from "uuid";
import { Subscription } from "./subscription.model";
import SosUserSubscription from "./sos_user_subscription.model";

class Payment extends Model {
  public id!: string;
  public sos_user_id!: string;
  public sos_user_subscription_id!: string;
  public amount!: number;
  public transaction_id!: string;
  public status!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sos_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sos_users",
        key: "id",
      },
    },
    sos_user_subscription_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sos_user_subscriptions",
        key: "id",
      },
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
    underscored: true,
  }
);

export { Payment };
