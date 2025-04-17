import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { userValidationSchemas } from '../../validation/user';
import agentAuthController from '../../controllers/agent/auth.controller';

import joiToJsonSchema from 'joi-to-json';
import { changePasswordValidationSchema } from '../../validation/agent.validation';
import { agentAuthMiddleware } from '../../middlewares/authStrategies';

export default async function agentsAuthRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/login/agent',
    schema: { body: joiToJsonSchema(userValidationSchemas.loginUser) },
    handler: agentAuthController.loginAgent,
  });

  fastify.route({
    method: 'POST',
    url: '/agent/change-password',
    preHandler: agentAuthMiddleware,
    schema: changePasswordValidationSchema,
    handler: agentAuthController.changePassword,
  });
}
