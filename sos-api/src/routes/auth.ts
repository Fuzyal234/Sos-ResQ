import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  addUser,
  logoutUser,
  LoginRequestBody,
  sendOtp,
  verifyOtp,
  loginUser,
} from "../controllers/auth.controller";
import { userValidationSchemas } from "../validation/user";
import User from "../models/user";
import { authMiddleware } from "../middlewares/auth";
import { successResponse, errorResponse } from '../helper/responses';
import joiToJsonSchema  from "joi-to-json";


export default async function userRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "POST",
    url: "/signup",
    schema: { body: joiToJsonSchema(userValidationSchemas.registerUserValidation) },
    handler: addUser,
  });

  fastify.route({
    method: "POST",
    url: "/login",
    schema: { body: joiToJsonSchema(userValidationSchemas.loginUser) },
    handler: loginUser,
  });
  fastify.route({
    method: "POST",
    url: "/send-otp",
    handler: sendOtp,
  });

  fastify.route({
    method: "POST",
    url: "/verify-otp",
    handler: verifyOtp,
  });
  fastify.route({
    method: "DELETE",
    url: "/logout",
    preHandler: authMiddleware,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = (request.headers["authorization"] || "").replace("Bearer ", "");

        const result = await logoutUser(token);

        if (result.success) {
          return reply.status(200).send({ message: "User logged out successfully." });
        }

        return reply.status(400).send({ error: result.error });
      } catch (error) {
        return reply.status(500).send({ error: "Internal server error." });
      }
    },
  });
}
