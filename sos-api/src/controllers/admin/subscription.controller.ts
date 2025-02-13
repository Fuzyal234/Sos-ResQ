import { FastifyRequest, FastifyReply } from "fastify";
import { successResponse, errorResponse } from "../../helper/responses";
import Agent from "../../models/agent.model";
import { CreateAgentDTO } from "../../types/agent.dto";
import { CreateUserDTO } from "../../types/user";
import Subscription from "../../models/subscription.model";
import { createUser } from '../../services/auth.service';
import { createAgent, getAgentById, getAllAgents, updateAgent } from "../../services/admin/agent.service";
import SubscriptionService  from "../../services/admin/subscription.service";
import { CreateSubscriptionDTO } from "../../types/subscription.dto";

class SubscriptionController {
    async index(request: FastifyRequest, reply: FastifyReply) {
        try {
            const subscriptions = await SubscriptionService.getAllSubscriptions();
            if (subscriptions.length === 0) {
                return reply.status(404).send(errorResponse("Subscriptions not found.", 404));
            }
            return reply.status(200).send(successResponse("Subscriptions fetched successfully!", subscriptions, 200));
        } catch (error) {
            console.error("Error fetching agents:", error);
            return reply.status(500).send(errorResponse("Internal server error.", 500));
        }
    }
    async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const subscriptionData = request.body as CreateSubscriptionDTO;
            const subscription = await SubscriptionService.createSubscription(subscriptionData);
            return reply.status(201).send(successResponse("Subscription created successfully!", subscription, 201));
        } catch (error) {
            console.error("Error creating agent:", error);
            return reply.status(500).send(errorResponse("Internal server error.", 500));
        }
    }
    async show(request: FastifyRequest, reply: FastifyReply) {
        try {
            const id = (request.params as { id: string }).id;
            const subscription = await SubscriptionService.getSubscriptionById(id);
            if (!subscription) {
                return reply.status(404).send(errorResponse("Subscription not found.", 404));
            }
            return reply.status(200).send(successResponse("Subscription fetched successfully!", subscription, 200));
        } catch (error) {
            console.error("Error fetching Subscription:", error);
            return reply.status(500).send(errorResponse("Internal server error.", 500));
        }
    };

    async update(request: FastifyRequest, reply: FastifyReply) {
        try {
            const subscriptionData = request.body as CreateSubscriptionDTO;
            const id = (request.params as { id: string }).id;
            const subscription = await SubscriptionService.updateSubscription(subscriptionData, id);
            return reply.status(200).send(successResponse("Subscription updated successfully!", subscription, 200));
        } catch (error) {
            console.error("Error updating Subscription:", error);
            return reply.status(500).send(errorResponse("Internal server error.", 500));
        }
    };
}

export const subscriptionController = new SubscriptionController();
