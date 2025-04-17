import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import adminAuthController from '../../controllers/admin/auth.controller';
import { adminLoginValidationSchema, userValidationSchemas } from '../../validation/user';
import joiToJsonSchema from 'joi-to-json';
import { adminAuthMiddleware } from '../../middlewares/authStrategies';
import { changePasswordValidationSchema } from '../../validation/agent.validation';

export default async function adminAuthRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/login/admin',
    schema: adminLoginValidationSchema,
    handler: adminAuthController.loginAdmin,
  });

  fastify.route({
    method: 'POST',
    url: '/admin/change-password',
    preHandler: adminAuthMiddleware,
    schema: changePasswordValidationSchema,
    handler: adminAuthController.changePassword,
  });
}
