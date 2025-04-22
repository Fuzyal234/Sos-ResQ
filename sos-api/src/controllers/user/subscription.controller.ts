import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../../helper/responses';
import SubscriptionService from '../../services/admin/subscription.service';
import { CreateSosUserSubscriptionDTO } from '../../types/subscription.dto';
import { UUID } from 'crypto';
import Stripe from 'stripe';
import stripe from '../../services/stripe.service';
import stripeService from '../../services/stripe.service';
import { Car, House, SosUser, SosUserSubscription, SubscriptionPrices } from '../../models/index';
import { ProtectedEntities } from '../../models/portected_entities.model';
import sosUserService from '../../services/user/sosUser.service';
import { exit } from 'process';
import paymentService from '../../services/payment.service';
import subscriptionService from '../../services/admin/subscription.service';

class SubscriptionController {
  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const subscriptions = await SubscriptionService.getAllSubscriptionsForUser();
      if (subscriptions.length === 0) {
        return reply.status(404).send(errorResponse('Subscriptions not found.', 404));
      }
      return reply.status(200).send(successResponse('Subscriptions fetched successfully!', subscriptions, 200));
    } catch (error) {
      console.error('Error fetching agents:', error);
      return reply.status(500).send(errorResponse('Internal server error.', 500));
    }
  }

  async subscribe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const sos_user_id = request.user.sos_user_id as UUID;
      const sos_user_profile = await sosUserService.getSosUserByUserId(sos_user_id);

      if (sos_user_profile && sos_user_profile.is_profile_completed === false) {
        return reply.status(400).send(errorResponse('Please complete your profile first.', 400));
      }
      const existingSubscription = await SosUserSubscription.findOne({
        where: { sos_user_id },
      });
      if (existingSubscription) {
        return reply.status(400).send(errorResponse('You already have an active subscription.', 400));
      }

      const { subscription_id, period, auto_renewal } = request.body as {
        subscription_id: UUID;
        auto_renewal: boolean;
        period: string;
      };

      const subscriptionData = {
        sos_user_id,
        subscription_id: subscription_id,
        auto_renewal,
      } as CreateSosUserSubscriptionDTO;

      const subscription = await SubscriptionService.getSubscriptionById(subscription_id);
      if (!subscription) {
        return reply.status(404).send(errorResponse('Subscription not found.', 404));
      }
      let car;
      if (subscription?.includes_car) {
        car = await Car.findOne({ where: { sos_user_id } });
        if (!car) {
          return reply.status(404).send(errorResponse('Car not found.', 404));
        }
      }
      let house;
      if (subscription?.includes_house) {
        house = await House.findOne({ where: { sos_user_id } });
        if (!house) {
          return reply.status(404).send(errorResponse('House not found.', 404));
        }
      }
      // const subscriptionData = request.body as CreateSosUserSubscriptionDTO;
      let priceId = null;
      let price = null;

      if (period === 'year') {
        // const yearly = subscription?.subscription_prices?.find(
        //   (price) => price.dataValues.period === 'year',
        // );
        // if (!yearly) {
        //   return reply.status(400).send(errorResponse('Yearly price not found for this subscription.', 400));
        // }
        priceId = subscription?.stripe_yearly_price_id;
        price = subscription.yearly_price;
      } else {
        priceId = subscription?.stripe_monthly_price_id;
        price = subscription.monthly_price;
      }

      const email = sos_user_profile?.email;
      if (!email) {
        throw new Error('Email is required');
      }
      const sos_subscription = await SubscriptionService.createSosUserSubscription(subscriptionData);

      const session = await stripeService.createCheckoutSession(priceId, email, sos_user_id);

      paymentService.createPayment(sos_user_id, sos_subscription.dataValues.id, price, session.id);
      // if (subscription?.dataValues.members_count === 1) {
      ProtectedEntities.create({
        entity_id: sos_user_id,
        entity_type: 'sos_user',
        sos_user_subscription_id: sos_subscription.dataValues.id,
      });
      // }
      if (car) {
        ProtectedEntities.create({
          entity_id: car.dataValues.id,
          entity_type: 'car',
          sos_user_subscription_id: sos_subscription.dataValues.id,
        });
      }
      if (house) {
        ProtectedEntities.create({
          entity_id: house.dataValues.id,
          entity_type: 'house',
          sos_user_subscription_id: sos_subscription.dataValues.id,
        });
      }

      return reply
        .status(201)
        .send(
          successResponse(
            'You have subscribed successfully!',
            { sessionId: session.id, subscription, sos_subscription },
            201,
          ),
        );
    } catch (error) {
      console.error('Error creating agent:', error);
      return reply.status(500).send(errorResponse('Internal server error.', 500));
    }
  }

  async stripeWebhook(request: FastifyRequest, reply: FastifyReply) {
    const event = request.body as Stripe.Event;
    console.log('event :>> ', event);
    if (event.type === 'payment_intent.succeeded') {
      const session_id = event.data.object.id;
      await paymentService.updatePayment(session_id, 'successful');
    } else if (event.type === 'payment_intent.payment_failed') {
      const session_id = event.data.object.id;
      await paymentService.updatePayment(session_id, 'failed');
    } else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const customer_id = invoice.customer ?? '';
      const subscriptionId = invoice.subscription ?? '';
      const sos_user = await SosUser.findOne({
        where: {
          stripe_cus_id: customer_id.toString(),
        },
        include: [{ model: SosUserSubscription, as: 'sos_user_subscription' }],
      });
      const sos_user_subscription = sos_user?.get('sos_user_subscription') as SosUserSubscription;
      if (typeof subscriptionId === 'string') {
        subscriptionService.updateSosUserSubscriptionStatus(
          sos_user_subscription?.dataValues.id,
          subscriptionId,
          'active',
        );
      } else {
        console.error('Invalid subscription ID:', subscriptionId);
      }
    } else if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const subscriptionId = session.subscription ?? '';
      const sos_user = await SosUser.findOne({
        where: {
          stripe_cus_id: session.customer?.toString(),
        },
      });
      const sos_user_subscription = sos_user?.get('sos_user_subscription') as SosUserSubscription;
      if (typeof subscriptionId === 'string') {
        subscriptionService.updateSosUserSubscriptionStatus(
          sos_user_subscription?.dataValues.id,
          subscriptionId,
          'active',
        );
      } else {
        console.error('Invalid subscription ID:', subscriptionId);
      }
    }

    return reply.status(200).send(successResponse('Webhook received successfully!', {}, 200));
  }
}
export default new SubscriptionController();
