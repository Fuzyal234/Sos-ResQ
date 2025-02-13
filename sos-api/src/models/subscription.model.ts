import { Model, DataTypes } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";

class Subscription extends Model {
  public id!: string;
  public name!: string;
  public tier!: string;
  public includes_house!: boolean;
  public includes_car!: boolean;
  public price!: number;
  

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
    tier: {
      type: DataTypes.ENUM('1', '2', '3', '4', '5'),
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
  },
  {
    sequelize: sequelizeInit,
    modelName: "subscription",
    tableName: "subscriptions",
    timestamps: true,
    underscored: true,
  }
);    
    export default Subscription;
    export {
        Subscription
    }