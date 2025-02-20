import { Transaction } from "sequelize";
import { CreateSosUserRequestDTO, SosRequestDTO } from "../../types/request.dto";
import { UUID } from "crypto";
import { userSockets } from "../../routes/user/user.routes";

import sos_request from "../../models/sos_request.model";
import sequelize from "../../config/sequelize";
import redisService from "../../services/redis.service";
import socketService from "../../services/socket.service";

class RequestService {
    /**
     * Create a new request
     * @param data Request details
     */
    public async createSosRequest(data: CreateSosUserRequestDTO): Promise<SosRequestDTO> {
        const transaction: Transaction = await sequelize.transaction();
        try {
            const request = await sos_request.create({ ...data }, { transaction });

            await transaction.commit();
            return request;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async processQueuedRequests(agentId: UUID) {
        console.log(`Agent ${agentId} is available, checking queue...`);
        const jobs = await redisService.getWaiting();

        if (jobs.length > 0) {
            const job = jobs[0];
            if( userSockets.get(job.data.sos_user_id)){

                socketService.assignRequestToAgent(job.data.sos_user_id, agentId);
            }
            await job.remove();
        }
        return;
    }
}

export default new RequestService();