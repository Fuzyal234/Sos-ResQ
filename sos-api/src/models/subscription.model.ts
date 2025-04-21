import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeInit from '../config/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from './payment.model';
import { SubscriptionPrices } from './subscription_prices.model';

interface SubscriptionAttributes {
  id: string;
  name: string;
  includes_house: boolean;
  includes_car: boolean;
  members_count: number;
  description: string;
  stripe_product_id: string;
  created_at?: Date;
  updated_at?: Date;
  subscription_prices?: SubscriptionPrices[];
}

interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id'> { }

class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> {
  public subscription_prices?: SubscriptionPrices[];

  public static associate(models: any) {
    Subscription.hasMany(models.SubscriptionPrices, {
      foreignKey: 'subscription_id',
      as: 'subscription_prices'
    });
  }
}

Subscription.init(
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
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripe_product_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: 'subscription',
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true,
  },
);

export { Subscription };
