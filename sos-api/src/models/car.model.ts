import { Model, DataTypes } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";

class Car extends Model {
    public id!: string;
    public sos_user_id!: string;
    public make!: string;
    public model!: string;
    public year!: number;
    public color!: string;
    public license_plate!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

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