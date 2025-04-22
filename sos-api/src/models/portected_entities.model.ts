import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeInit from '../config/sequelize';
import User from './user.model';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';

interface ProtectedEntitiesAttributes {
  id: UUID;
  entity_id: string;
  entity_type: string;
  sos_user_subscription_id: UUID;
}
interface ProtectedEntitiesCreationAttributes extends Optional<ProtectedEntitiesAttributes, 'id'> {}

export class ProtectedEntities extends Model<ProtectedEntitiesAttributes, ProtectedEntitiesCreationAttributes> {}

ProtectedEntities.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    entity_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.ENUM('car', 'house', 'sos_user'),
      allowNull: false,
    },
    sos_user_subscription_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sos_user_subscriptions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: 'protected_entities',
    tableName: 'protected_entities',
    timestamps: true,
    underscored: true,
  },
);
