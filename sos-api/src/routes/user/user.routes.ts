import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../middlewares/auth";
import subscriptionController from "../../controllers/user/subscription.controller";

export default async function userRoutes(fastify: FastifyInstance) {
    fastify.route({ method: "GET", url: "/subscriptions", handler: subscriptionController.index, });
    fastify.route({ method: "POST", url: "/user/subscribe", preHandler: authMiddleware, handler: subscriptionController.subscribe, });
}