import { Model, DataTypes, Sequelize } from "sequelize";
import { v4 as uuidv4 } from 'uuid';
import sequelizeInit from '../config/sequelize';

class RentalDetails extends Model {
  public rental_id!: string;
  public property!: string;
  public street_address!: string;
  public appartment!: string;
  public rent_amount!: string;
  public due_date!: string;
  public month_to_month!: boolean;
  public lease_start_date!: Date;
  public lease_end_date!: Date;
  public lease_type!: string;
  public lease_co_signers!: string;
  public lease_source!: string;


  static associate(models: any) {
  }
}
  RentalDetails.init(
    {
      rental_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: uuidv4,
        allowNull: false,
      },
      property: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      street_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      appartment: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rent_amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      due_date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      month_to_month: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      lease_start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      lease_end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      lease_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lease_co_signers: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lease_source: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
       },
      
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
      },
     
    },
    {
      sequelize:sequelizeInit,
      modelName: "RentalDetails",
      tableName: "rental_details",
   
    }
  );



export default RentalDetails;
