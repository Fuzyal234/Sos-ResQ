import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { UUID } from "crypto";
import { SosRequestDTO } from "../../types/request.dto";
import requestService from "../../services/user/request.service";
import socketService from "../../services/socket.service";
import redisService from "../../services/redis.service";
import { SosUser, SosUserSubscription } from "../../models";
import { errorResponse } from "../../helper/responses";

class RequestController {
    async createRequest(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
        const { longitude, latitude } = request.body as { longitude: number; latitude: number; }
        const location = `${longitude},${latitude}`;
        const sos_user_id = request.user as UUID;
        const user_subscription = await SosUserSubscription.findOne({ where: { sos_user_id, status: "active" } });

        if (!user_subscription) {
            return reply.status(400).send(errorResponse("User subscription is not active", 400));
        }

        const status = "pending";
        const request_timestamp = new Date();
        const sos_request: SosRequestDTO = await requestService.createSosRequest({ sos_user_id, location, status, request_timestamp });
        const room_id = await socketService.createChatRoom(sos_user_id,);
        const sockets = await fastify.io.fetchSockets()

        redisService.addToQueue(sos_request);
        fastify.io.to('room_agent_notifications').emit('sos_request_notification', { room_id, sos_user_id });

        sockets.forEach((sock) => {
            if (sock.data.user === sos_user_id) {
                sock.join(room_id)
            }
        })

        reply.send({ status: 'created', room_id, message: 'Request created successfully. You will be shortly connected to an available agent' });
    }

    async getQueuedJobs(request: FastifyRequest, reply: FastifyReply) {
        const jobs = await redisService.getWaiting();
        reply.send(jobs);
    }
}

const requestController = new RequestController();
export { requestController };