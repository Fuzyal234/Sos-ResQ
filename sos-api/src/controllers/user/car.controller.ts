import { FastifyReply, FastifyRequest } from "fastify";
import { successResponse, errorResponse } from "../../helper/responses";
import { CreateCarDTO } from "../../types/car.dto";
import { Car } from "../../models";
import { UUID } from "crypto";


class CarController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const sos_user_id = request.user as UUID;
            const car = request.body as CreateCarDTO;

            car.sos_user_id = sos_user_id;

            const newCar = await Car.create({ ...car, });

            return reply.status(201).send(successResponse("Car created successfully!", newCar, 201));
        } catch (error) {
            console.error("Error creating car:", error);
            return reply.status(500).send(errorResponse("Internal server error", 500));
        }
    }
}

export default new CarController();