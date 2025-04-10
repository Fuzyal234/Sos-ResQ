import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeInit from '../config/sequelize';
import { v4 as uuidv4 } from 'uuid';

interface SosRequestAttributes {
  id: string;
  sos_user_id: string;
  agent_id: string | null;
  location: string;
  status: string;
  request_timestamp: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

interface SosRequestCreationAttributes
  extends Optional<SosRequestAttributes, 'id'> {}
class SosRequest extends Model<
  SosRequestAttributes,
  SosRequestCreationAttributes
> {}

SosRequest.init(
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
      type: DataTypes.ENUM(
        'pending',
        'in_progress',
        'resolved',
        'rejected',
        'cancelled',
      ),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize: sequelizeInit,
    modelName: 'sos_request',
    tableName: 'sos_requests',
    timestamps: true,
    underscored: true,
  },
);

export default SosRequest;
