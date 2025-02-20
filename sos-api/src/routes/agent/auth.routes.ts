import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { userValidationSchemas } from "../../validation/user";
import { loginAgent } from "../../controllers/agent/auth.controller";

import joiToJsonSchema from "joi-to-json";

export default async function agentsAuthRoutes(fastify: FastifyInstance) {

  fastify.route({
    method: "POST",
    url: "/login/agent",
    schema: { body: joiToJsonSchema(userValidationSchemas.loginUser) },
    handler: loginAgent,
  });
}
