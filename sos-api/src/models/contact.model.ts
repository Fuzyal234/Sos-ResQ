import { Model, DataTypes, Optional } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";
import { UUID } from "crypto";

interface ContactAttributes {
    id: UUID;
    sos_user_id: string;
    name: string;
    phone: string;
    relation: string;

    created_at?: Date;
    updated_at?: Date;
}
interface ContactCreationAttributes extends Optional<ContactAttributes, 'id'> { }
class Contact extends Model<ContactAttributes, ContactCreationAttributes> { }

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