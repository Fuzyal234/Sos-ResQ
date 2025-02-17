import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  addUser,
  logoutUser,
} from "../../controllers/user/auth.controller";

import { loginAdmin } from "../../controllers/admin/auth.controller";
import { userValidationSchemas } from "../../validation/user";
import User from "../../models/user.model";
import { authMiddleware } from "../../middlewares/auth";
import { successResponse, errorResponse } from '../../helper/responses';
import joiToJsonSchema  from "joi-to-json";
import { loginAgent } from "../../controllers/agent/auth.controller";


export default async function agentsAuthRoutes(fastify: FastifyInstance) {

  fastify.route({
    method: "POST",
    url: "/login/agent",
    schema: { body: joiToJsonSchema(userValidationSchemas.loginUser) },
    handler: loginAgent,
  });


}
