import Fastify from 'fastify';
import { Configuration, CountryCode, PlaidApi, PlaidEnvironments, Products } from 'plaid';
import sequelizeInit from './config/sequelize';
import authRoute from './routes/auth';
import rentalRoutes from './routes/rental';
// import googleAuthRoute from './routes/googleAuth';


const fastify = Fastify({ logger: true });

fastify.register(authRoute);
fastify.register(rentalRoutes);
// fastify.register(googleAuthRoute);
const startServer = async () => {
  try {
    await sequelizeInit.authenticate();
    console.log(' Database connected successfully');

    await fastify.listen({ port: Number(process.env.API_PORT) || 4444, host: '0.0.0.0' });
    console.log(`Server running on port ${process.env.API_PORT || 4444}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();
