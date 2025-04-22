import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeInit from '../config/sequelize';
import { UUID } from 'crypto';

interface SosUserSubscriptionAttributes {
  id: UUID;
  sos_user_id: UUID;
  subscription_id: UUID;
  start_date: Date;
  end_date: Date;
  status: string;
  auto_renewal: boolean;
  stripe_sub_id?: string;
  created_at?: Date;
  updated_at?: Date;
}
interface SosUserSubscriptionCreationAttributes extends Optional<SosUserSubscriptionAttributes, 'id'> {}

class SosUserSubscription extends Model<SosUserSubscriptionAttributes, SosUserSubscriptionCreationAttributes> {}

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
        model: 'sos_users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    subscription_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'subscriptions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
    },
    auto_renewal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    stripe_sub_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: 'sos_user_subscription',
    tableName: 'sos_user_subscriptions',
    timestamps: true,
    underscored: true,
  },
);

export default SosUserSubscription;
