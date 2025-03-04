import { Model, DataTypes } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";
import { Payment } from "./payment.model";

class Subscription extends Model {
  public id!: string;
  public name!: string;
  public tier!: string;
  public includes_house!: boolean;
  public includes_car!: boolean;
  public price!: number;
  public description!: string;
  public stripe_product_id!: string;
  public stripe_price_id!: string;
  

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

const subscription = Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    members_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    includes_house: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    includes_car: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripe_product_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripe_price_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: "subscription",
    tableName: "subscriptions",
    timestamps: true,
    underscored: true,
  }
);

export { Subscription }