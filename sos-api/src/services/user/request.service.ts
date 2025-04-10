import { Transaction } from 'sequelize';
import {
  CreateSosUserRequestDTO,
  SosRequestDTO,
} from '../../types/request.dto';
import { UUID } from 'crypto';
import { userSockets } from '../../routes/user/user.routes';
import SosRequest from '../../models/sos_request.model';
import sequelize from '../../config/sequelize';
import redisService from '../../services/redis.service';
import socketService from '../../services/socket.service';

class RequestService {
  /**
   * Create a new request
   * @param data Request details
   */
  public async createSosRequest(
    data: CreateSosUserRequestDTO,
  ): Promise<SosRequestDTO> {
    const transaction: Transaction = await sequelize.transaction();
    try {
      const request = await SosRequest.create(
        {
          ...data,
          agent_id: null,
          status: 'pending',
        },
        { transaction },
      );

      await transaction.commit();
      return {
        id: request.dataValues.id,
        sos_user_id: request.dataValues.sos_user_id,
        agent_id: request.dataValues.agent_id,
        location: request.dataValues.location,
        status: request.dataValues.status,
        request_timestamp: request.dataValues.request_timestamp,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async processQueuedRequests(agentId: UUID) {
    console.log(`Agent ${agentId} is available, checking queue...`);
    const jobs = await redisService.getWaiting();

    if (jobs && jobs.length > 0) {
      const job = jobs[0];
      if (!job || !job.data || !job.data.sos_user_id) {
        console.error('Invalid job data:', job);
        return;
      }

      const userSocket = userSockets.get(job.data.sos_user_id);
      if (userSocket) {
        try {
          await socketService.assignRequestToAgent(
            job.data.sos_user_id,
            agentId,
          );
          await job.remove();
        } catch (error) {
          console.error('Error processing queued request:', error);
        }
      } else {
        console.log(`No active socket found for user ${job.data.sos_user_id}`);
        await job.remove();
      }
    }
  }
}

export default new RequestService();
