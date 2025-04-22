import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeInit from '../config/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';

interface FamilyMemberAttributes {
  id: string;
  sos_user_id: UUID;
  user_subscription_id: UUID;
  invited_by: string;
  status: string;

  created_at?: Date;
  updated_at?: Date;
}
interface FamilyMemberCreationAttributes extends Optional<FamilyMemberAttributes, 'id'> {}

class FamilyMember extends Model<FamilyMemberAttributes, FamilyMemberCreationAttributes> {}

FamilyMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    sos_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sos_users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    user_subscription_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user_subscriptions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    invited_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sos_users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: 'family_member',
    tableName: 'family_members',
    timestamps: true,
    underscored: true,
  },
);

export default FamilyMember;
