import Fastify from 'fastify';
import sequelizeInit from './config/sequelize';
import authRoute from './routes/user/auth.routes';
import adminAuthRoutes from './routes/admin/auth.routes';
import adminRoutes from './routes/admin/admin.routes';
import agentsAuthRoutes from './routes/agent/auth.routes';
import userRoutes from './routes/user/user.routes';
import websocket from '@fastify/websocket';
import agentRoutes from './routes/agent/agent.routes';
import googleAuthRoute from './routes/googleAuth';
import fastifyMultipart from '@fastify/multipart';
import ajvErrors from 'ajv-errors';
// import { Server } from 'socket.io';
import socketPlugin from './plugins/socketPlugin';
import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import { fastifySchedule } from '@fastify/schedule';
import job from './crons/subscriptionStatusUpdater.cron';

// const fastify = Fastify({
//   ajv: {
//     customOptions: {
//       allErrors: true,
//     },
//     plugins: [ajvErrors],
//   },
//   logger: true
// });
const fastify = Fastify({ logger: true });

const ajv = new Ajv({ allErrors: true, strict: false });
ajvFormats(ajv);
ajvErrors(ajv);

fastify.setValidatorCompiler(({ schema }) => ajv.compile(schema));
fastify.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    const errors = error.validation.flatMap(e => {
      if (e.keyword === 'errorMessage' && Array.isArray(e.params?.errors)) {
        return e.params.errors.map(innerErr => ({
          field:
            innerErr.params?.missingProperty ||
            innerErr.instancePath.replace('/', ''),
          message: e.message,
        }));
      }

      return [
        {
          field: e.params?.missingProperty || e.instancePath.replace('/', ''),
          message: e.message,
        },
      ];
    });

    return reply.status(400).send({
      status: 400,
      message: 'Validation error',
      error: true,
      errors,
    });
  }

  reply.send(error);
});

// Start Server
const startServer = async () => {
  try {
    await sequelizeInit.authenticate();
    console.log('Database connected successfully');

    await fastify.register(socketPlugin);

    fastify.register(fastifyMultipart, {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      attachFieldsToBody: true,
    });

    fastify.register(authRoute);
    fastify.register(adminAuthRoutes);
    fastify.register(adminRoutes);
    fastify.register(agentsAuthRoutes);
    fastify.register(userRoutes);
    fastify.register(agentRoutes);
    fastify.register(fastifySchedule);
    fastify.ready().then(() => {
      fastify.scheduler.addCronJob(job);
    });
    await fastify.listen({
      port: Number(process.env.API_PORT) || 4444,
      host: '0.0.0.0',
    });
    console.log(`Server running on port ${process.env.API_PORT || 4444}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();

export default fastify;
