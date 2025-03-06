import { Model, DataTypes } from "sequelize";
import sequelizeInit from "../config/sequelize";
import { v4 as uuidv4 } from "uuid";

class FamilyMember extends Model {
    public id!: string;
    public sos_user_id!: string;
    public user_subscription_id!: string;
    public invited_by!: string;
    public status !: string;
    
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

FamilyMember.init(
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
        user_subscription_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'user_subscriptions',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        invited_by: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'sos_users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        status: {
            type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
            allowNull: false,
        },
        
    },
    {
        sequelize: sequelizeInit,
        modelName: 'family_member',
        tableName: 'family_members',
        timestamps: true,
        underscored: true,
    }
)

export default FamilyMember