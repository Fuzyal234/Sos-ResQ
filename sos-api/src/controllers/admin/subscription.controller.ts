import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../../helper/responses';
import { Subscription } from '../../models/index';
import SubscriptionService from '../../services/admin/subscription.service';
import { CreateSubscriptionDTO, SubscriptionDTO, UpdateSubscriptionDTO } from '../../types/subscription.dto';
import { validate as isUUID } from 'uuid';
import stripeService from '../../services/stripe.service';

class SubscriptionController {
  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const subscriptions = await SubscriptionService.getAllSubscriptions();
      if (subscriptions.length === 0) {
        return reply.status(404).send(errorResponse('Subscriptions not found.', 404));
      }

      const formattedSubscriptions = subscriptions.map((subscription: any) => {
        let monthlyPrice = null;
        let yearlyPrice = null;

        if (subscription.subscription_prices && subscription.subscription_prices.length > 0) {
          for (const price of subscription.subscription_prices) {
            if (price.period === 'month') {
              monthlyPrice = price.price;
            } else if (price.period === 'year') {
              yearlyPrice = price.price;
            }
          }
        }

        return {
          id: subscription.id,
          name: subscription.name,
          members_count: subscription.members_count,
          includes_car: subscription.includes_car,
          includes_house: subscription.includes_house,
          description: subscription.description,
          monthly_price: monthlyPrice,
          yearly_price: yearlyPrice,
        };
      });

      return reply
        .status(200)
        .send(successResponse('Subscriptions fetched successfully!', formattedSubscriptions, 200));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return reply.status(500).send(errorResponse('Internal server error.', 500));
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const subscriptionData = request.body as SubscriptionDTO;
      const existing = await Subscription.findOne({
        where: { name: subscriptionData.name },
      });
      if (existing) {
        throw new Error('Subscription plan name already exists');
      }
      const { product, monthlyStripePrice, yearlyStripePrice } = await stripeService.createProduct(
        subscriptionData.name,
        subscriptionData.description,
        subscriptionData.monthly_price,
        subscriptionData.yearly_price,
      );
      subscriptionData.stripe_product_id = product.id;

      const createSubscriptionData: CreateSubscriptionDTO = {
        name: subscriptionData.name,
        members_count: subscriptionData.members_count,
        includes_car: subscriptionData.includes_car,
        includes_house: subscriptionData.includes_house,
        description: subscriptionData.description,
        stripe_product_id: product.id,
      };

      const subscription = await SubscriptionService.createSubscription(createSubscriptionData);
      const monthlySubscriptionPrice = await SubscriptionService.createSubscriptionPrice(
        subscription.dataValues.id,
        subscriptionData.monthly_price,
        monthlyStripePrice.id,
        'month',
      );
      const yearlySubscriptionPrice = await SubscriptionService.createSubscriptionPrice(
        subscription.dataValues.id,
        subscriptionData.yearly_price,
        yearlyStripePrice.id,
        'year',
      );

      return reply.status(201).send(
        successResponse(
          'Subscription created successfully!',
          {
            subscription,
            monthlySubscriptionPrice,
            yearlySubscriptionPrice,
          },
          201,
        ),
      );
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }
      return reply.status(500).send(errorResponse('Internal server error.', 500));
    }
  }
  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const id = (request.params as { id: string }).id;
      if (!isUUID(id)) {
        return reply.status(400).send(errorResponse('Invalid UUID format.', 400));
      }
      const subscription = await SubscriptionService.getSubscriptionById(id);
      if (!subscription) {
        return reply.status(404).send(errorResponse('Subscription not found.', 404));
      }
      return reply.status(200).send(successResponse('Subscription fetched successfully!', subscription, 200));
    } catch (error) {
      console.error('Error fetching Subscription:', error);
      return reply.status(500).send(errorResponse('Internal server error.', 500));
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const subscriptionData = request.body as UpdateSubscriptionDTO;
      const id = (request.params as { id: string }).id;

      const old_subscription = await SubscriptionService.getSubscriptionById(id);
      const oldMonthlyPrice: number = old_subscription?.monthly_price as number;
      const oldYearlyPrice: number = old_subscription?.yearly_price as number;
      const newMonthlyPrice: number = subscriptionData.monthly_price as number;
      const newYearlyPrice: number = subscriptionData.yearly_price as number;
      let monthlyPrice;
      let yearlyPrice;
      if (oldMonthlyPrice !== newMonthlyPrice) {
        monthlyPrice = await stripeService.updateMonthlyPrice(
          old_subscription?.stripe_product_id || '',
          subscriptionData?.monthly_price as number,
        );
      }
      if (oldYearlyPrice !== newYearlyPrice) {
        yearlyPrice = await stripeService.updateYearlyPrice(
          old_subscription?.stripe_product_id || '',
          subscriptionData?.yearly_price as number,
        );
      }
      console.log('old_subscription :>> ', old_subscription);
      console.log('monthlyPrice ...:>> ', monthlyPrice);
      console.log('yearlyPrice ...:>> ', yearlyPrice);

      const product = await stripeService.updateProduct(old_subscription?.stripe_product_id || '', {
        name: subscriptionData.name,
        description: subscriptionData.description,
      });

      const subscription = await SubscriptionService.updateSubscription(subscriptionData, id);

      const subscriptionPrice = await SubscriptionService.updateSubscriptionPrice(
        subscription?.dataValues.id,
        subscriptionData.monthly_price as number,
        monthlyPrice?.id || '',
        'month',
      );

      const yearlySubscriptionPrice = await SubscriptionService.updateSubscriptionPrice(
        subscription?.dataValues.id as string,
        subscriptionData.yearly_price as number,
        yearlyPrice?.id || '',
        'year',
      );

      return reply.status(200).send(successResponse('Subscription updated successfully!', subscription, 200));
    } catch (error) {
      console.error('Error updating Subscription:', error);
      return reply.status(500).send(errorResponse('Internal server error.', 500));
    }
  }
}

export const subscriptionController = new SubscriptionController();
