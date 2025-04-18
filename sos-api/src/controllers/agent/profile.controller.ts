import { FastifyReply, FastifyRequest } from 'fastify';
import { errorResponse, successResponse } from '../../helper/responses';
import { Agent, User } from '../../models/index';
import { validateAgentProfileUpdateFields } from '../../validation/agentProfile.validation';
import s3Service from '../../services/s3.service';
import sequelize from '../../config/sequelize';

class AgentProfileController {
  public async getAgentProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const agent = await Agent.findByPk(request.user.agent_id, {
        attributes: {
          exclude: ['password', 'role'],
        },
        include: [
          {
            model: User,
            as: 'user',
          },
        ],
      });
      if (!agent) {
        return reply.status(404).send(errorResponse('Agent not found', 404));
      }
      type AgentWithUser = {
        id: string;
        user_id: string;
        first_name: string;
        last_name: string;
        email: string;
        date_of_birth: Date;
        avatar_url: string | null;
        created_at: Date;
        updated_at: Date;
      };
      const agentProfile: AgentWithUser = {
        id: agent.dataValues.id,
        user_id: agent.dataValues.user.id,
        first_name: agent.dataValues.user.first_name,
        last_name: agent.dataValues.user.last_name,
        email: agent.dataValues.user.email,
        date_of_birth: agent.dataValues.user.date_of_birth,
        avatar_url: agent.dataValues.user.avatar_url,
        created_at: agent.dataValues.created_at,
        updated_at: agent.dataValues.updated_at,
      };

      return reply.status(200).send(successResponse('Agent profile fetched successfully.', agentProfile, 200));
    } catch (e) {
      console.log(e);
      return reply.status(500).send(errorResponse('Something went wrong', 500));
    }
  }

  public async updateAgentProfile(request: FastifyRequest, reply: FastifyReply) {
    const errors = validateAgentProfileUpdateFields(request.body);
    if (errors.length > 0) {
      return reply.code(400).send({
        status: 400,
        message: 'Validation error',
        error: true,
        errors,
      });
    }
    try {
      const agent = await Agent.findByPk(request.user.agent_id);
      if (!agent) {
        return reply.status(404).send(errorResponse('Agent not found', 404));
      }
      const { first_name, last_name, avatar } = request.body as {
        first_name: { value: string };
        last_name: { value: string };
        date_of_birth: { value: string };
        address: { value: string };
        gender: { value: string };
        avatar: any;
      };

      const user = await User.findByPk(request.user.id);
      if (!user) {
        return reply.status(404).send(errorResponse('User not found', 404));
      }
      let avatar_url = agent.dataValues.avatar_url;

      if (avatar && ['image/png', 'image/jpeg', 'image/jpg'].includes(avatar.mimetype)) {
        const fileBuffer = await avatar.toBuffer();
        const fileName = `${Date.now()}-${avatar.filename}`;
        if (fileName) {
          avatar_url = await s3Service.uploadFile(fileBuffer, fileName);
          console.log('avatar_url :>> ', avatar_url);
        }
      }

      const transaction = await sequelize.transaction();
      const updatedUser = await user.update(
        { first_name: first_name.value, last_name: last_name.value },
        { transaction },
      );
      const updatedAgent = await agent.update({ avatar_url }, { transaction });
      console.log('commiting the transaction');
      await transaction.commit();

      return reply.status(200).send(successResponse('Agent profile updated successfully.', updatedAgent, 200));
    } catch (e) {
      console.log(e);
      return reply.status(500).send(errorResponse('Something went wrong', 500));
    }
  }
}

export default new AgentProfileController();
