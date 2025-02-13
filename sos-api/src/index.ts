import Fastify from 'fastify';
import { Configuration, CountryCode, PlaidApi, PlaidEnvironments, Products } from 'plaid';
import sequelizeInit from './config/sequelize';
import authRoute from './routes/user/auth';
import adminAuthRoutes from './routes/admin/auth.route';
import adminRoutes from './routes/admin/admin.route';
import agentsAuthRoutes from './routes/agent/auth.route';

const fastify = Fastify({ logger: true });

fastify.register(authRoute);
fastify.register(adminAuthRoutes);
fastify.register(adminRoutes);
fastify.register(agentsAuthRoutes);
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
