import { Model, DataTypes, Optional } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";

interface CarAttributes {
    id: string;
    sos_user_id: string;
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
    created_at?: Date;
    updated_at?: Date;
}
interface CarCreationAttributes extends Optional<CarAttributes, "id"> { }
class Car extends Model<CarAttributes, CarCreationAttributes> { }

Car.init(
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
        make: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        license_plate: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize: sequelizeInit,
        modelName: 'car',
        tableName: 'cars',
        timestamps: true,
        underscored: true,
    }
)

export default Car