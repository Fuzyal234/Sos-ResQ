import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../../helper/responses';
import { Subscription } from '../../models/subscription.model';
import SubscriptionService from '../../services/admin/subscription.service';
import { CreateSubscriptionDTO } from '../../types/subscription.dto';
import { validate as isUUID } from 'uuid';
import stripeService from '../../services/stripe.service';

class SubscriptionController {
  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const subscriptions = await SubscriptionService.getAllSubscriptions();
      if (subscriptions.length === 0) {
        return reply
          .status(404)
          .send(errorResponse('Subscriptions not found.', 404));
      }
      return reply
        .status(200)
        .send(
          successResponse(
            'Subscriptions fetched successfully!',
            subscriptions,
            200,
          ),
        );
    } catch (error) {
      console.error('Error fetching agents:', error);
      return reply
        .status(500)
        .send(errorResponse('Internal server error.', 500));
    }
  }
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const subscriptionData = request.body as CreateSubscriptionDTO;
      const existing = await Subscription.findOne({
        where: { name: subscriptionData.name },
      });
      if (existing) {
        throw new Error('Subscription plan name already exists');
      }
      const { product, stripePrice } = await stripeService.createProduct(
        subscriptionData.name,
        subscriptionData.description,
        subscriptionData.price,
      );
      subscriptionData.stripe_product_id = product.id;
      subscriptionData.stripe_price_id = stripePrice.id;
      const subscription = await SubscriptionService.createSubscription(
        subscriptionData,
      );

      return reply
        .status(201)
        .send(
          successResponse(
            'Subscription created successfully!',
            subscription,
            201,
          ),
        );
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }
      return reply
        .status(500)
        .send(errorResponse('Internal server error.', 500));
    }
  }
  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const id = (request.params as { id: string }).id;
      if (!isUUID(id)) {
        return reply
          .status(400)
          .send(errorResponse('Invalid UUID format.', 400));
      }
      const subscription = await SubscriptionService.getSubscriptionById(id);
      if (!subscription) {
        return reply
          .status(404)
          .send(errorResponse('Subscription not found.', 404));
      }
      return reply
        .status(200)
        .send(
          successResponse(
            'Subscription fetched successfully!',
            subscription,
            200,
          ),
        );
    } catch (error) {
      console.error('Error fetching Subscription:', error);
      return reply
        .status(500)
        .send(errorResponse('Internal server error.', 500));
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const subscriptionData = request.body as CreateSubscriptionDTO;
      const id = (request.params as { id: string }).id;

      const old_subscription = await SubscriptionService.getSubscriptionById(
        id,
      );
      const old_price = old_subscription?.dataValues.price;
      const new_price = subscriptionData.price as number;

      if (old_price !== new_price) {
        stripeService.updateProductPrice(
          old_subscription?.dataValues.stripe_product_id || '',
          subscriptionData.price,
        );
      }
      const product = await stripeService.updateProduct(
        old_subscription?.dataValues.stripe_product_id || '',
        {
          name: subscriptionData.name,
          description: subscriptionData.description,
        },
      );
      const subscription = await SubscriptionService.updateSubscription(
        subscriptionData,
        id,
      );
      return reply
        .status(200)
        .send(
          successResponse(
            'Subscription updated successfully!',
            subscription,
            200,
          ),
        );
    } catch (error) {
      console.error('Error updating Subscription:', error);
      return reply
        .status(500)
        .send(errorResponse('Internal server error.', 500));
    }
  }
}

export const subscriptionController = new SubscriptionController();
