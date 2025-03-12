import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { loginAdmin } from "../../controllers/admin/auth.controller";
import { userValidationSchemas } from "../../validation/user";
import joiToJsonSchema  from "joi-to-json";

export default async function adminAuthRoutes(fastify: FastifyInstance) {

  fastify.route({
    method: "POST",
    url: "/login/admin",
    schema: { body: joiToJsonSchema(userValidationSchemas.loginUser) },
    handler: loginAdmin,
  });
}
