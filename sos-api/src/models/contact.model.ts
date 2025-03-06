import { Model, DataTypes } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";
import { UUID } from "crypto";

class Contact extends Model {
    public id!: UUID;
    public sos_user_id!: string;
    public name!: string;
    public phone!: string;
    public relation!: string;
    
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Contact.init(
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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        relation: {
            type: DataTypes.ENUM("father", "mother", "brother", "sister", "son", "daughter", "friend", "other"),
            allowNull: false,
        }
    },
    {
        sequelize: sequelizeInit,
        modelName: 'contact',
        tableName: 'contacts',
        timestamps: true,
        underscored: true,
    }
)

export default Contact