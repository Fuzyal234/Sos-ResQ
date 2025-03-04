import { FastifyReply, FastifyRequest } from "fastify";
import { successResponse, errorResponse } from "../../helper/responses";
import { CreateHouseDTO } from "../../types/house.dto";
import { House } from "../../models";
import { UUID } from "crypto";

class HouseController {
    async create (request: FastifyRequest, reply: FastifyReply) {
        try {
            const sos_user_id = request.user as UUID;
            const house = request.body as CreateHouseDTO;
    
            house.sos_user_id = sos_user_id;
            console.log('house :>> ', house);
            const newHouse = await House.create({ ...house,  });
    
            return successResponse("House created successfully!", newHouse, 201);
        } catch (error) {
            console.error("Error creating house:", error);
            return reply.status(500).send(errorResponse(error.message, 500));
        }
    }
}

export default new HouseController();