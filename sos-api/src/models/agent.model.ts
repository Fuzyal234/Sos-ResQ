import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeInit from '../config/sequelize';
import { v4 as uuidv4 } from 'uuid';

interface AgentAttributes {
  id: string;
  user_id: string;
  status: string;
  avatar_url?: string;

  created_at?: Date;
  updated_at?: Date;
}

interface AgentCreationAttributes extends Optional<AgentAttributes, 'id'> {}

class Agent extends Model<AgentAttributes, AgentCreationAttributes> {}

Agent.init(
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
    status: {
      type: DataTypes.ENUM('online', 'available', 'busy', 'offline'),
      allowNull: false,
      defaultValue: 'offline',
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: 'agent',
    tableName: 'agents',
    timestamps: true,
    underscored: true,
  },
);

export default Agent;
