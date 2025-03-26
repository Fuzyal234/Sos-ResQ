import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeInit from '../config/sequelize';
import User from './user.model';
import { Payment } from './payment.model';
import SosUserSubscription from './sos_user_subscription.model';

interface SosUserAttributes {
  id: string;
  user_id: string;
  address?: string;
  avatar_url?: string;
  is_profile_completed?: boolean;
  contact_added?: boolean;
  stripe_cus_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Define creation attributes (fields optional during creation, like `id`)
interface SosUserCreationAttributes extends Optional<SosUserAttributes, 'id'> {}

class SosUser extends Model<SosUserAttributes, SosUserCreationAttributes> {}

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
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_profile_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    contact_added: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    stripe_cus_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: 'sos_user',
    tableName: 'sos_users',
    timestamps: true,
    underscored: true,
  },
);

export default SosUser;
