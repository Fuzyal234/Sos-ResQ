import { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse, errorResponse } from '../../helper/responses';
import { UUID } from 'crypto';
import redisService from '../../services/redis.service';

class ChatController {
  async getChatHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const sos_user_id = request.user.sos_user_id as UUID;
      const roomId = await redisService.getUserRoom(sos_user_id);

      if (!roomId) {
        return reply.status(404).send(errorResponse('Room not found', 404));
      }

      const messages = await redisService.getChatHistory(roomId);

      return reply
        .status(200)
        .send(successResponse('Chat history', messages, 200));
    } catch (error) {
      console.error('Error getting chat history:', error);
      return reply
        .status(500)
        .send(errorResponse('Internal server error', 500));
    }
  }
}

export default new ChatController();
