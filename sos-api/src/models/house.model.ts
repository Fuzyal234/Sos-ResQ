import { Model, DataTypes, Optional } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";

interface HouseAttributes {
    id: string;
    sos_user_id: string;
    address: string;
    created_at?: Date;
    updated_at?: Date;
}

interface HouseCreationAttributes extends Optional<HouseAttributes, 'id'> { }

class House extends Model<HouseAttributes, HouseCreationAttributes> { }

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