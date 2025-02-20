import { FastifyInstance } from "fastify";
import { authMiddleware } from "../../middlewares/auth";
import { requestController } from "../../controllers/user/request.controller";
import { UUID } from "crypto";
import { WebSocket } from 'ws';
import { Agent } from "../../models";

import subscriptionController from "../../controllers/user/subscription.controller";
import redisService from "../../services/redis.service";

export default async function userRoutes(fastify: FastifyInstance) {

    fastify.route({ method: "GET", url: "/subscriptions", handler: subscriptionController.index, });
    fastify.route({ method: "POST", url: "/user/subscribe", preHandler: authMiddleware, handler: subscriptionController.subscribe, });

    fastify.route({ method: "POST", url: "/user/requests", preHandler: authMiddleware, handler: requestController.createRequest, });
    fastify.route({ method: "GET", url: "/user/requests", preHandler: authMiddleware, handler: requestController.getQueuedJobs, });

    fastify.get('/ws/user/chat', { websocket: true, preHandler: authMiddleware }, (connection, req) => {
        const userId = req.user as UUID;
        userSockets.set(userId, connection);

        connection.on('close', () => {
            Agent.update({ status: 'available' }, { where: { user_id: userId } });
            redisService.removeJobFromQueue(userId);
            userSockets.delete(userId);
        });
    });
}

const userSockets = new Map<UUID, WebSocket>();
const agentSockets = new Map<UUID, WebSocket>();
export { requestController, userSockets, agentSockets };
