import { Model, DataTypes } from 'sequelize';
import sequelizeInit from '../config/sequelize';
import User from './user.model';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';


export class ProtectedEntities extends Model {

  public id!: string;
  public entity_id!: number;
  public entity_type!: string;
  public sos_user_subscription_id!: UUID;
}

ProtectedEntities.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING,
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
  }
);