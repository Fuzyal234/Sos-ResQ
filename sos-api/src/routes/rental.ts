import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { addRentalDetails } from "../controllers/rental";
import { rentalValidationSchemas } from "../validation/rental";
import { successResponse, errorResponse } from '../helper/responses';

export default async function rentalRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "POST",
    url: "/rental-details",
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { error } = rentalValidationSchemas.addRentalValidation.validate(request.body);
    },
    handler: async (request, reply) => {
      try {
        const result = await addRentalDetails(request, reply);
        return reply.status(201).send(successResponse("User registered successfully!", result, 201));
      } catch (error) {
        console.error("Error during signup:", error);
        return reply.status(500).send(errorResponse("Internal server error.", 500));
      }
    },
  });
}
