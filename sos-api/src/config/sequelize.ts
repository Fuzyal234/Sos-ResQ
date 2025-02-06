import { Sequelize } from 'sequelize';
import logger from '../utils/logger';
const sequelizeInit = new Sequelize(
  process.env.DATABASE_NAME as string,      
  process.env.DATABASE_USER as string,     
  process.env.DATABASE_PASSWORD as string, 
  {
    host: process.env.DATABASE_HOST as string, 
    dialect: 'postgres',                      
    logging: (msg) => logger.info(msg), 
  }
);

export default sequelizeInit;

export const authenticateDatabase = async () => {
  try {
    await sequelizeInit.authenticate(); 
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error; 
  }
};
