import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../../helper/responses';
import { CreateAgentDTO } from '../../types/agent.dto';
import { CreateUserDTO } from '../../types/user';
import { validate as isUUID } from 'uuid';
import agentService from '../../services/admin/agent.service';
import { and } from 'sequelize';

export const index = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const agents = await agentService.getAllAgents();
    if (agents.length === 0) {
      return reply.status(404).send(errorResponse('No agents found.', 404));
    }
    return reply
      .status(200)
      .send(successResponse('Agents fetched successfully!', agents, 200));
  } catch (error) {
    console.error('Error fetching agents:', error);
    return reply.status(500).send(errorResponse('Internal server error.', 500));
  }
};

export const create = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userData = request.body as CreateUserDTO;
    const agent = await agentService.createAgent(userData);

    return reply
      .status(201)
      .send(successResponse('Agent created successfully!', agent, 201));
  } catch (error) {
    console.error('Error creating agent:', error);
    return reply.status(500).send(errorResponse('Internal server error.', 500));
  }
};

export const update = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userData = request.body as CreateAgentDTO;
    const id = (request.params as { id: string }).id;
    const agent = await agentService.updateAgent(userData, id);
    return reply
      .status(200)
      .send(successResponse('Agent updated successfully!', agent, 200));
  } catch (error) {
    console.error('Error updating agent:', error);
    if (error instanceof Error) {
      if (error.message === 'Agent not found' || error.message === 'User not found') {
        return reply.status(404).send(errorResponse(error.message, 404));
      }
      return reply.status(500).send(errorResponse(error.message, 500));
    }
    return reply.status(500).send(errorResponse('Internal server error.', 500));
  }
};

export const show = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const id = (request.params as { id: string }).id;
    if (!isUUID(id)) {
      return reply.status(400).send(errorResponse('Invalid UUID format.', 400));
    }
    const agent = await agentService.getAgentById(id);
    if (!agent) {
      return reply.status(404).send(errorResponse('Agent not found.', 404));
    }
    return reply
      .status(200)
      .send(successResponse('Agent fetched successfully!', agent, 200));
  } catch (error) {
    console.error('Error fetching agent:', error);
    return reply.status(500).send(errorResponse('Internal server error.', 500));
  }
};
