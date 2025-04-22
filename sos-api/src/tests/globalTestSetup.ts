import Fastify, { FastifyInstance } from 'fastify';
import sequelizeInit from '../config/sequelize';
import adminRoutes from '../routes/admin/admin.routes';
import authRoutes from '../routes/admin/auth.routes';
import userAuthRoutes from '../routes/user/auth.routes';
import userRoutes from '../routes/user/user.routes';
import agentsAuthRoutes from '../routes/agent/auth.routes';
import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import redisService from '../services/redis.service';
import socketPlugin from '../plugins/socketPlugin';
import fastifyMultipart from '@fastify/multipart';

// Initialize fastify with a default instance
let fastify: FastifyInstance = Fastify();

beforeAll(async () => {
  try {
    // Test DB connection
    await sequelizeInit.authenticate();
    await sequelizeInit.sync();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }

  // Register socket plugin first
  await fastify.register(socketPlugin, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Register multipart plugin for file uploads
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    attachFieldsToBody: true,
  });

  // Register routes
  fastify.register(adminRoutes);
  fastify.register(authRoutes);
  fastify.register(userAuthRoutes);
  fastify.register(userRoutes);
  fastify.register(agentsAuthRoutes);

  // Start the server
  try {
    await fastify.listen({ port: 4444, host: '127.0.0.1' });
  } catch (error: any) {
    if (error.code === 'EADDRINUSE') {
      console.log('Port 4444 is in use, trying to close existing connections...');
      // You might want to add logic here to find and close the process using port 4444
      // For now, we'll just try a different port
      await fastify.listen({ port: 4445, host: '127.0.0.1' });
    } else {
      throw error;
    }
  }
  await fastify.ready();
});

afterAll(async () => {
  if (fastify) {
    await fastify.close();
  }
  await redisService.close();
  await sequelizeInit.close();

  console.log('All tests completed.');
});

const ajv = new Ajv({ allErrors: true, strict: false });
ajvFormats(ajv);
ajvErrors(ajv);

if (fastify) {
  fastify.setValidatorCompiler(({ schema }: { schema: any }) => ajv.compile(schema));
  fastify.setErrorHandler((error: any, request: any, reply: any) => {
    if (error.validation) {
      const errors = error.validation.flatMap((e: any) => {
        if (e.keyword === 'errorMessage' && Array.isArray(e.params?.errors)) {
          return e.params.errors.map((innerErr: any) => ({
            field: innerErr.params?.missingProperty || innerErr.instancePath.replace('/', ''),
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
}

export default fastify;
