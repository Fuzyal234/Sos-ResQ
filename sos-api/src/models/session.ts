import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import sequelizeInit from '../config/sequelize';
import { UUID } from 'crypto';
export class session extends Model {

  declare id: string;
  declare user_id: number;
  declare token: string;
  declare refresh_token: string;
  static user_id: UUID;
}

session.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
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
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: 'session',
    tableName: 'user_sessions',
    timestamps: true,
    underscored: true,
  }
);

export default session;
