import { FastifyRequest, FastifyReply } from "fastify";
import { UUID } from "crypto";
import { SosRequestDTO } from "../../types/request.dto";

import requestService from "../../services/user/request.service";
import socketService from "../../services/socket.service";
import redisService from "../../services/redis.service";

class RequestController {
    async createRequest(request: FastifyRequest, reply: FastifyReply) {
        const { longitude, latitude } = request.body as { longitude: number; latitude: number; }
        const location = `${longitude},${latitude}`;
        const sos_user_id = request.user as UUID;
        const status = "pending";
        const request_timestamp = new Date();
        const sos_request : SosRequestDTO = await requestService.createSosRequest({ sos_user_id, location, status, request_timestamp });
        redisService.addToQueue(sos_request);
        socketService.notifyAvailableAgents(sos_user_id);
        reply.send({ status: 'created', message: 'Request created successfully. You will be shortly connected to an available agent' });
    }

    async getQueuedJobs(request: FastifyRequest, reply: FastifyReply) {
        const jobs = await redisService.getWaiting();
        reply.send(jobs);
    }
}

const requestController = new RequestController();
export { requestController };