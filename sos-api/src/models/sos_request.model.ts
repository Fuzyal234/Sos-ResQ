import { Model, DataTypes } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";

class SosRequest extends Model {
    public id!: string;
    public sos_user_id!: string;
    public agent_id!: string;
    public location!: string;
    public status!: string;
    public request_timestamp!: Date;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

const sos_request = SosRequest.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        sos_user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        agent_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        request_timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("pending", "in_progress", "resolved", "rejected", "cancelled"),
            allowNull: false,
            defaultValue: "pending",
        },
    },
    {
        sequelize: sequelizeInit,
        modelName: "sos_request",
        tableName: "sos_requests",
        timestamps: true,
        underscored: true,
    }
);

export default sos_request;
