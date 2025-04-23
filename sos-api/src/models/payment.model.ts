import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeInit from '../config/sequelize';
import User from './user.model';
import SosUser from './sos_user.model';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from './subscription.model';
import SosUserSubscription from './sos_user_subscription.model';
import { UUID } from 'crypto';

interface PaymentAttributes {
  id: UUID;
  sos_user_id: UUID;
  sos_user_subscription_id: UUID;
  amount: number;
  transaction_id?: string;
  status: string;
  session_id: string;
  created_at?: Date;
  updated_at?: Date;
}
interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id'> {}
class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> {}

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
        model: 'sos_users',
        key: 'id',
      },
    },
    sos_user_subscription_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sos_user_subscriptions',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    underscored: true,
  },
);

export { Payment };
