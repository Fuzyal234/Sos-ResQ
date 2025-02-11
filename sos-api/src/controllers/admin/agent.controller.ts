import { FastifyRequest, FastifyReply } from "fastify";
import { successResponse, errorResponse } from "../../helper/responses";
import Agent from "../../models/agent.model";
import { CreateAgentDTO } from "../../types/agent.dto";
import { CreateUserDTO } from "../../types/user";
import User from "../../models/user";
import { createUser } from '../../services/auth.service';
import { createAgent, getAgentById, getAllAgents, updateAgent } from "../../services/admin/agent.service";

export const index = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const agents = await getAllAgents();

        return reply.status(200).send(successResponse("Agents fetched successfully!", agents, 200));
    } catch (error) {
        console.error("Error fetching agents:", error);
        return reply.status(500).send(errorResponse("Internal server error.", 500));
    }
};

export const create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userData = request.body as CreateUserDTO;
        const agent = await createAgent(userData);

        return reply.status(201).send(successResponse("Agent created successfully!", agent, 201));
    } catch (error) {
        console.error("Error creating agent:", error);
        return reply.status(500).send(errorResponse("Internal server error.", 500));
    }
};

export const update = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userData = request.body as CreateAgentDTO;
        const id = (request.params as { id: string }).id;
        const agent = await updateAgent(userData, id);
        return reply.status(200).send(successResponse("Agent updated successfully!", agent, 200));
    } catch (error) {
        console.error("Error updating agent:", error);
        return reply.status(500).send(errorResponse("Internal server error.", 500));
    }
};

export const show = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const id = (request.params as { id: string }).id;
        const agent = await getAgentById(id);
        if (!agent) {
            return reply.status(404).send(errorResponse("Agent not found.", 404));
        }
        return reply.status(200).send(successResponse("Agent fetched successfully!", agent, 200));
    } catch (error) {
        console.error("Error fetching agent:", error);
        return reply.status(500).send(errorResponse("Internal server error.", 500));
    }
};