import { FastifyRequest, FastifyReply } from "fastify";
import { successResponse, errorResponse } from "../../helper/responses";
import SubscriptionService  from "../../services/admin/subscription.service";
import { CreateSosUserSubscriptionDTO } from "../../types/subscription.dto";
import { UUID } from "crypto";

class SubscriptionController {
    async index(request: FastifyRequest, reply: FastifyReply) {
        try {
            const subscriptions = await SubscriptionService.getAllSubscriptionsForUser();
            if (subscriptions.length === 0) {
                return reply.status(404).send(errorResponse("Subscriptions not found.", 404));
            }
            return reply.status(200).send(successResponse("Subscriptions fetched successfully!", subscriptions, 200));
        } catch (error) {
            console.error("Error fetching agents:", error);
            return reply.status(500).send(errorResponse("Internal server error.", 500));
        }
    }

    async subscribe(request: FastifyRequest, reply: FastifyReply) {
        try {
            const subscriptionId = (request.body as { subscription_id: UUID }).subscription_id;
            const auto_renewal = (request.body as { auto_renewal: boolean }).auto_renewal;
            const sos_user_id = request.user as UUID;
            const subscriptionData = { sos_user_id, subscription_id: subscriptionId, auto_renewal } as CreateSosUserSubscriptionDTO;
            // const subscriptionData = request.body as CreateSosUserSubscriptionDTO;
            const subscription = await SubscriptionService.createSosUserSubscription(subscriptionData);
            return reply.status(201).send(successResponse("You have subscribed successfully!", subscription, 201));
        } catch (error) {
            console.error("Error creating agent:", error);
            return reply.status(500).send(errorResponse("Internal server error.", 500));
        }
    }
}
export default new SubscriptionController();