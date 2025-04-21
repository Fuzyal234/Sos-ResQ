import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeInit from '../config/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from './payment.model';

interface SubscriptionPricesAttributes {
  id: string;
  subscription_id: string;
  price: number;
  stripe_price_id: string;
  period: string;
  created_at?: Date;
  updated_at?: Date;
}
interface SubscriptionPriceCreationAttributes extends Optional<SubscriptionPricesAttributes, 'id'> {}
class SubscriptionPrices extends Model<SubscriptionPricesAttributes, SubscriptionPriceCreationAttributes> {}

SubscriptionPrices.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    subscription_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subscriptions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    stripe_price_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    period: {
      type: DataTypes.ENUM('month', 'year'),
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: 'subscription_prices',
    tableName: 'subscription_prices',
    timestamps: true,
    underscored: true,
  },
);

export { SubscriptionPrices };
