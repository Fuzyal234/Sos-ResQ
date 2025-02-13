import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { index, create, update, show } from "../../controllers/admin/agent.controller";
import { subscriptionController } from "../../controllers/admin/subscription.controller";
import { adminAuthMiddleware, authMiddleware } from "../../middlewares/auth";


export default async function adminRoutes(fastify: FastifyInstance) {

  // Agent CRUD routes
  fastify.route({ method: "GET", url: "/admin/agents/:id", preHandler: adminAuthMiddleware, handler: show, });
  fastify.route({ method: "GET", url: "/admin/agents", preHandler: adminAuthMiddleware, handler: index, });
  fastify.route({ method: "POST", url: "/admin/agents", preHandler: adminAuthMiddleware, handler: create, });
  fastify.route({ method: "PUT", url: "/admin/agents/:id", preHandler: adminAuthMiddleware, handler: update, });

  //Subscription CRUD routes
  fastify.route({ method: "GET", url: "/admin/subscriptions", preHandler: adminAuthMiddleware, handler: subscriptionController.index, });
  fastify.route({ method: "POST", url: "/admin/subscriptions", preHandler: adminAuthMiddleware, handler: subscriptionController.create, });
  fastify.route({ method: "GET", url: "/admin/subscription/:id", preHandler: adminAuthMiddleware, handler: subscriptionController.show, });
  fastify.route({ method: "PUT", url: "/admin/subscription/:id", preHandler: adminAuthMiddleware, handler: subscriptionController.update, });


}
