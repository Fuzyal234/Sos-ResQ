import Fastify from 'fastify';
import sequelizeInit from './config/sequelize';
import authRoute from './routes/user/auth.routes';
import adminAuthRoutes from './routes/admin/auth.routes';
import adminRoutes from './routes/admin/admin.routes';
import agentsAuthRoutes from './routes/agent/auth.routes';
import userRoutes from './routes/user/user.routes';
import websocket from '@fastify/websocket';
import agentRoutes from './routes/agent/agent.routes';

const fastify = Fastify({ logger: true });

fastify.register(websocket, {
  options: {  
    maxPayload: 1048576,
    perMessageDeflate: false,
  }
});

// Register Routes
fastify.register(authRoute);
fastify.register(adminAuthRoutes);
fastify.register(adminRoutes);
fastify.register(agentsAuthRoutes);
fastify.register(userRoutes);
fastify.register(agentRoutes);

// Start Server
const startServer = async () => {
  try {
    await sequelizeInit.authenticate();
    console.log('Database connected successfully');

    await fastify.listen({ port: Number(process.env.API_PORT) || 4444, host: '0.0.0.0' });
    console.log(`Server running on port ${process.env.API_PORT || 4444}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();

export default fastify;