import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { index, create } from "../../controllers/admin/agent.controller";

import { loginAdmin } from "../../controllers/admin/auth.controller";
import { userValidationSchemas } from "../../validation/user";
import User from "../../models/user";
import { adminAuthMiddleware, authMiddleware } from "../../middlewares/auth";
import { successResponse, errorResponse } from '../../helper/responses';
import joiToJsonSchema  from "joi-to-json";


export default async function adminRoutes(fastify: FastifyInstance) {

    // Agent CRUD routes
  fastify.route({ method: "GET", url: "/admin/agents", preHandler: adminAuthMiddleware, handler: index, });
  fastify.route({ method: "POST", url: "/admin/agents", preHandler: adminAuthMiddleware, handler: create, });


}
