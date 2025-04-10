import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { UUID } from 'crypto';
import { SosRequestDTO } from '../../types/request.dto';
import requestService from '../../services/user/request.service';
import socketService from '../../services/socket.service';
import redisService from '../../services/redis.service';
import { SosUser, SosUserSubscription } from '../../models';
import { errorResponse, successResponse } from '../../helper/responses';
import { FamilyMember } from '../../models/index';

class RequestController {
  async createRequest(
    fastify: FastifyInstance,
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const room = await redisService.getUserRoom(
      request.user.sos_user_id as UUID,
    );
    if (room) {
      return reply
        .status(400)
        .send(errorResponse('You already have an active request', 400));
    }
    const { longitude, latitude } = request.body as {
      longitude: number;
      latitude: number;
    };
    const location = `${longitude},${latitude}`;
    const sos_user_id = request.user.sos_user_id as UUID;
    const user_subscription = await SosUserSubscription.findOne({
      where: { sos_user_id, status: 'active' },
    });
    const userFamily = await FamilyMember.findOne({
      where: { sos_user_id, status: 'accepted' },
      include: ['user_subscription'],
    });

    // #TODO: This code is commented only during Developemnt

    // const isEligibleUser =
    //   user_subscription ||
    //   userFamily ||
    //   (userFamily &&
    //     (userFamily as FamilyMember).dataValues.user_subscription.dataValues
    //       .status === 'active');
    // if (!isEligibleUser) {
    //   return reply
    //     .status(400)
    //     .send(errorResponse('User subscription is not active', 400));
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

    redisService.setUserRoom(sos_user_id, room_id);
    const socketId = await redisService.getUserSocket(sos_user_id);
    if (socketId) {
      console.log('socketId :>>>>>> in the request controller ', socketId);
      const socket = fastify.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.join(room_id);
      }
    }

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
