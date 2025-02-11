import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  addUser,
  logoutUser,
} from "../../controllers/auth.controller";

import { loginAdmin } from "../../controllers/admin/auth.controller";
import { userValidationSchemas } from "../../validation/user";
import User from "../../models/user";
import { authMiddleware } from "../../middlewares/auth";
import { successResponse, errorResponse } from '../../helper/responses';
import joiToJsonSchema  from "joi-to-json";


export default async function adminAuthRoutes(fastify: FastifyInstance) {

  fastify.route({
    method: "POST",
    url: "/login/admin",
    schema: { body: joiToJsonSchema(userValidationSchemas.loginUser) },
    handler: loginAdmin,
  });


}
