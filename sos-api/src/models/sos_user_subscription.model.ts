import { Model, DataTypes } from "sequelize";
import sequelizeInit from "../config/sequelize";
import User from "./user";
import { Payment } from "./payment.model";
import SosUser from "./sos_user.model";

class SosUserSubscription extends Model {
  public id!: string;
  public sos_user_id!: string;
  public subscription_id!: string;
  public start_date!: Date;
  public end_date!: Date;
  public status!: string;
  public auto_renewal!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SosUserSubscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sos_user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "sos_users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    subscription_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "subscriptions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
    },
    auto_renewal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: "sos_user_subscription",
    tableName: "sos_user_subscriptions",
    timestamps: true,
    underscored: true,
  }
);

export default SosUserSubscription;