import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  addUser,
  loginUser,
  logoutUser,
  LoginRequestBody,
  sendOtp,
  verifyOtp,
} from "../controllers/auth";
import { userValidationSchemas } from "../validation/user";
import User from "../models/user";
import { authMiddleware } from "../middlewares/auth";
import { successResponse, errorResponse } from '../helper/responses';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "POST",
    url: "/signup",
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { error } = userValidationSchemas.registerUserValidation.validate(request.body);
      if (error) {
        return reply.status(400).send(errorResponse(error.details[0].message, 400));
      }

      const { email } = request.body as { email: string };
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return reply.status(400).send(errorResponse("Email already exists!", 400));
      }
    },
    handler: async (request, reply) => {
      try {
        const result = await addUser(request, reply);
        return reply.status(201).send(successResponse("User registered successfully!", result, 201));
      } catch (error) {
        console.error("Error during signup:", error);
        return reply.status(500).send(errorResponse("Internal server error.", 500));
      }
    },
  });

   fastify.route({
    method: "POST",
    url: "/login",
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { error } = userValidationSchemas.loginUser.validate(request.body);
      if (error) {
        return reply.status(400).send(errorResponse(error.details[0].message, 400));
      }
      const { email, password } = request.body as { email: string, password: string  };
      if (!email || !password) {
        return reply.status(400).send(errorResponse("Email and password are required.", 400));
      }
      const body: LoginRequestBody = { email: email, password: password};
      try {
        const result = await loginUser(request, reply);
        return reply.status(200).send(successResponse("Login successful", result, 200));
      } catch (err) {
        return reply.status(401).send(errorResponse("Invalid email or password", 401));
      }
    },
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
