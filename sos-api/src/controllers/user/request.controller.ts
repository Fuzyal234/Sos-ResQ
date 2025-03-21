import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { UUID } from 'crypto';
import { SosRequestDTO } from '../../types/request.dto';
import requestService from '../../services/user/request.service';
import socketService from '../../services/socket.service';
import redisService from '../../services/redis.service';
import { SosUser, SosUserSubscription } from '../../models';
import { errorResponse, successResponse } from '../../helper/responses';

class RequestController {
  async createRequest(
    fastify: FastifyInstance,
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { longitude, latitude } = request.body as {
      longitude: number;
      latitude: number;
    };
    const location = `${longitude},${latitude}`;
    const sos_user_id = request.user as UUID;
    const user_subscription = await SosUserSubscription.findOne({
      where: { sos_user_id, status: 'active' },
    });
    // #TODO: This code is commented only during Developemnt
    // if (!user_subscription) {
    //     return reply.status(400).send(errorResponse("User subscription is not active", 400));
    // }
    // #TODO: This code is commented only during Developemnt
    const status = 'pending';
    const request_timestamp = new Date();
    console.log('sos_user_id :>> ', sos_user_id);
    const sos_request: SosRequestDTO = await requestService.createSosRequest({
      sos_user_id,
      location,
      status,
      request_timestamp,
    });
    const room_id = await socketService.createChatRoom(sos_user_id);
    const sockets = await fastify.io.fetchSockets();

    redisService.addToQueue(sos_request);
    fastify.io
      .to('room_agent_notifications')
      .emit('sos_request_notification', { room_id, sos_user_id });

    sockets.forEach(sock => {
      if (sock.data.user === sos_user_id) {
        sock.join(room_id);
      }
    });

    return reply
      .status(201)
      .send(
        successResponse(
          'Request created successfully!',
          { sos_request, room_id },
          201,
        ),
      );
  }

  async getQueuedJobs(request: FastifyRequest, reply: FastifyReply) {
    const jobs = await redisService.getWaiting();
    reply.send(jobs);
  }
}

const requestController = new RequestController();
export { requestController };
