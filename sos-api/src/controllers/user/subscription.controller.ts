import { FastifyRequest, FastifyReply } from "fastify";
import { successResponse, errorResponse } from "../../helper/responses";
import SubscriptionService from "../../services/admin/subscription.service";
import { CreateSosUserSubscriptionDTO } from "../../types/subscription.dto";
import { UUID } from "crypto";
import Stripe from "stripe";
import stripe from "../../services/stripe.service";
import stripeService from "../../services/stripe.service";
import { Car, House } from "../../models/index";
import { ProtectedEntities } from "../../models/portected_entities.model";

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

            const subscription = await SubscriptionService.getSubscriptionById(subscriptionId);
            if (!subscription) {
                return reply.status(404).send(errorResponse("Subscription not found.", 404));
            }
            let car
            if (subscription?.dataValues.includes_car) {
                car = await Car.findOne({ where: { sos_user_id } });
                if (!car) {
                    return reply.status(404).send(errorResponse("Car not found.", 404));
                }
            }
            let house;
            if (subscription?.dataValues.includes_house) {
                house = await House.findOne({ where: { sos_user_id } });
                if (!house) {
                    return reply.status(404).send(errorResponse("House not found.", 404));
                }
            }
            // const subscriptionData = request.body as CreateSosUserSubscriptionDTO;

            const { email, priceId } = request.body as { email: string; priceId: string };

            const success_url = "";
            const cancel_url = "";

            const session = await stripeService.createCheckoutSession(priceId, email, success_url, cancel_url);


            const sos_subscription = await SubscriptionService.createSosUserSubscription(subscriptionData);
            if(car){

                ProtectedEntities.create({
                    entity_id: car.dataValues.id,
                    entity_type: "car",
                    sos_user_subscription_id: sos_subscription.dataValues.id
                })
            }
            if(house){
                
                ProtectedEntities.create({
                    entity_id: house.dataValues.id,
                    entity_type: "house",
                    sos_user_subscription_id: sos_subscription.dataValues.id
                })
            }

            return reply.status(201).send(successResponse("You have subscribed successfully!", { sessionId: session.id, subscription }, 201));
        } catch (error) {
            console.error("Error creating agent:", error);
            return reply.status(500).send(errorResponse("Internal server error.", 500));
        }
    }
}
export default new SubscriptionController();