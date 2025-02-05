import { Model, DataTypes } from 'sequelize';
import sequelizeInit from '../config/sequelize';
import User from './user';
import { v4 as uuidv4 } from 'uuid';


export class session extends Model {

  declare id: string;
  declare user_id: number;
  declare token: string;
  static user_id: any;
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
        key: 'user_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    token: {
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

session.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(session, { foreignKey: 'user_id', as: 'sessions' });

export default session;
