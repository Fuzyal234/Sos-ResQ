import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { subscriptionController } from '../../controllers/admin/subscription.controller';
import { adminAuthMiddleware } from '../../middlewares/authStrategies';
import joiToJsonSchema from 'joi-to-json';
import { index, create, update, show } from '../../controllers/admin/agent.controller';
import { createAgentValidationSchema, updateAgentValidationSchema } from '../../validation/agent.validation';
import {
  subscriptionCreateValidationSchema,
  subscriptionUpdateValidationSchema,
} from '../../validation/subscribe.validation';

export default async function adminRoutes(fastify: FastifyInstance) {
  // Agent CRUD routes
  fastify.route({
    method: 'GET',
    url: '/admin/agents/:id',
    preHandler: adminAuthMiddleware,
    handler: show,
  });
  fastify.route({
    method: 'GET',
    url: '/admin/agents',
    preHandler: adminAuthMiddleware,
    handler: index,
  });
  fastify.route({
    method: 'POST',
    url: '/admin/agents',
    schema: createAgentValidationSchema,
    preHandler: adminAuthMiddleware,
    handler: create,
  });
  fastify.route({
    method: 'PUT',
    url: '/admin/agents/:id',
    schema: updateAgentValidationSchema,
    preHandler: adminAuthMiddleware,
    handler: update,
  });

  //Subscription CRUD routes
  fastify.route({
    method: 'GET',
    url: '/admin/subscriptions',
    preHandler: adminAuthMiddleware,
    handler: subscriptionController.index,
  });
  fastify.route({
    method: 'POST',
    url: '/admin/subscriptions',
    schema: subscriptionCreateValidationSchema,
    preHandler: adminAuthMiddleware,
    handler: subscriptionController.create,
  });
  fastify.route({
    method: 'GET',
    url: '/admin/subscription/:id',
    preHandler: adminAuthMiddleware,
    handler: subscriptionController.show,
  });
  fastify.route({
    method: 'PUT',
    url: '/admin/subscription/:id',
    schema: subscriptionUpdateValidationSchema,
    preHandler: adminAuthMiddleware,
    handler: subscriptionController.update,
  });
}
