import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { sosUserAuthMiddleware } from '../../middlewares/authStrategies';
import { requestController } from '../../controllers/user/request.controller';
import { UUID } from 'crypto';
import { WebSocket } from 'ws';
import { Agent } from '../../models';

import subscriptionController from '../../controllers/user/subscription.controller';
import redisService from '../../services/redis.service';
import profileController from '../../controllers/user/profile.controller';
import carController from '../../controllers/user/car.controller';
import houseController from '../../controllers/user/house.controller';
import familyController from '../../controllers/user/family.controller';
import contactController from '../../controllers/user/contact.controller';
import { carCreateValidationSchema } from '../../validation/car.validation';
import { houseCreateValidationSchema } from '../../validation/house.validation';
import { sosRequestValidationSchema } from '../../validation/sos_request.validation';
import { subscribeValidationSchema } from '../../validation/subscribe.validation';
import {
  confirmMemberInviteValidationSchema,
  memberInviteValidationSchema,
} from '../../validation/family.validation';
import {
  contactCreateValidationSchema,
  contactUpdateValidationSchema,
} from '../../validation/contact.validation';
import chatController from '../../controllers/user/chat.controller';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/subscriptions',
    handler: subscriptionController.index,
  });
  fastify.route({
    method: 'POST',
    url: '/user/subscribe',
    schema: subscribeValidationSchema,
    preHandler: sosUserAuthMiddleware,
    handler: subscriptionController.subscribe,
  });

  fastify.route({
    method: 'POST',
    url: '/user/requests',
    schema: sosRequestValidationSchema,
    preHandler: sosUserAuthMiddleware,
    handler: (req, res) => requestController.createRequest(fastify, req, res),
  });
  fastify.route({
    method: 'GET',
    url: '/user/requests',
    preHandler: sosUserAuthMiddleware,
    handler: requestController.getQueuedJobs,
  });

  fastify.route({
    method: 'GET',
    url: '/user/profile',
    preHandler: sosUserAuthMiddleware,
    handler: profileController.getProfile,
  });
  fastify.route({
    method: 'PUT',
    url: '/user/profile',
    preHandler: sosUserAuthMiddleware,
    handler: profileController.updateProfile,
  });

  fastify.route({
    method: 'POST',
    url: '/webhook',
    handler: subscriptionController.stripeWebhook,
  });

  fastify.route({
    method: 'POST',
    url: '/user/invite',
    schema: memberInviteValidationSchema,
    preHandler: sosUserAuthMiddleware,
    handler: familyController.inviteMember,
  });
  fastify.route({
    method: 'POST',
    url: '/user/accept-invite',
    preHandler: sosUserAuthMiddleware,
    handler: familyController.acceptInvitation,
  });
  fastify.route({
    method: 'POST',
    url: '/user/confirm-invite',
    schema: confirmMemberInviteValidationSchema,
    preHandler: sosUserAuthMiddleware,
    handler: familyController.confirmInvite,
  });

  fastify.route({
    method: 'GET',
    url: '/user/contacts',
    preHandler: sosUserAuthMiddleware,
    handler: contactController.index,
  });
  fastify.route({
    method: 'POST',
    url: '/user/contact',
    schema: contactCreateValidationSchema,
    preHandler: sosUserAuthMiddleware,
    handler: contactController.create,
  });
  fastify.route({
    method: 'PUT',
    url: '/user/contact',
    schema: contactUpdateValidationSchema,
    preHandler: sosUserAuthMiddleware,
    handler: contactController.update,
  });

  fastify.route({
    method: 'POST',
    url: '/user/car',
    schema: carCreateValidationSchema,
    preHandler: sosUserAuthMiddleware,
    handler: carController.create,
  });
  fastify.route({
    method: 'POST',
    url: '/user/house',
    schema: houseCreateValidationSchema,
    preHandler: sosUserAuthMiddleware,
    handler: houseController.create,
  });
  fastify.route({
    method: 'GET',
    url: '/user/chat-history',
    preHandler: sosUserAuthMiddleware,
    handler: chatController.getChatHistory,
  });

  fastify.get(
    '/ws/user/chat',
    { websocket: true, preHandler: sosUserAuthMiddleware },
    (connection, req) => {
      const userId = req.user as UUID;
      userSockets.set(userId, connection);

      connection.on('close', () => {
        Agent.update({ status: 'available' }, { where: { user_id: userId } });
        redisService.removeJobFromQueue(userId);
        userSockets.delete(userId);
      });
    },
  );
}

const userSockets = new Map<UUID, WebSocket>();
const agentSockets = new Map<UUID, WebSocket>();
export { requestController, userSockets, agentSockets };
