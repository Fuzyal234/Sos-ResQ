import { Model, DataTypes } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";

class House extends Model {
    public id!: string;
    public sos_user_id!: string;
    public address!: string;
    
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

House.init(
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
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        
    },
    {
        sequelize: sequelizeInit,
        modelName: 'house',
        tableName: 'houses',
        timestamps: true,
        underscored: true,
    }
)

export default House