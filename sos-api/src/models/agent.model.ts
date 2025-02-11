import { Model, DataTypes } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user";

class Agent extends Model {
    public id!: string;
    public user_id!: string;
    public status!: string;
}

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
            type: DataTypes.ENUM('available', 'busy', 'offline'),
            allowNull: false,
        },
    },
    {
        sequelize: sequelizeInit,
        modelName: 'agent',
        tableName: 'agents',
        timestamps: true,
        underscored: true,
    }
)
Agent.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
export default Agent