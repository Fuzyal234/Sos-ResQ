import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../../helper/responses';
import SubscriptionService from '../../services/admin/subscription.service';
import { CreateSosUserSubscriptionDTO } from '../../types/subscription.dto';
import { UUID } from 'crypto';
import Stripe from 'stripe';
import stripe from '../../services/stripe.service';
import stripeService from '../../services/stripe.service';
import { Car, House, SosUser, SosUserSubscription } from '../../models/index';
import { ProtectedEntities } from '../../models/portected_entities.model';
import sosUserService from '../../services/user/sosUser.service';
import { exit } from 'process';
import paymentService from '../../services/payment.service';
import subscriptionService from '../../services/admin/subscription.service';

class SubscriptionController {
  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const subscriptions =
        await SubscriptionService.getAllSubscriptionsForUser();
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

  async subscribe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const sos_user_id = request.user as UUID;
      const sos_user_profile = await sosUserService.getSosUserByUserId(
        sos_user_id,
      );

      if (sos_user_profile && sos_user_profile.is_profile_completed === false) {
        return reply
          .status(400)
          .send(errorResponse('Please complete your profile first.', 400));
      }

      const subscriptionId = (request.body as { subscription_id: UUID })
        .subscription_id;
      const auto_renewal = (request.body as { auto_renewal: boolean })
        .auto_renewal;
      const subscriptionData = {
        sos_user_id,
        subscription_id: subscriptionId,
        auto_renewal,
      } as CreateSosUserSubscriptionDTO;

      const subscription = await SubscriptionService.getSubscriptionById(
        subscriptionId,
      );
      if (!subscription) {
        return reply
          .status(404)
          .send(errorResponse('Subscription not found.', 404));
      }
      let car;
      if (subscription?.dataValues.includes_car) {
        car = await Car.findOne({ where: { sos_user_id } });
        if (!car) {
          return reply.status(404).send(errorResponse('Car not found.', 404));
        }
      }
      let house;
      if (subscription?.dataValues.includes_house) {
        house = await House.findOne({ where: { sos_user_id } });
        if (!house) {
          return reply.status(404).send(errorResponse('House not found.', 404));
        }
      }
      // const subscriptionData = request.body as CreateSosUserSubscriptionDTO;
      const priceId = subscription?.dataValues.stripe_price_id;
      const email = sos_user_profile?.email;
      if (!email) {
        throw new Error('Email is required');
      }
      const sos_subscription =
        await SubscriptionService.createSosUserSubscription(subscriptionData);

      const session = await stripeService.createCheckoutSession(
        priceId,
        email,
        sos_user_id,
      );

      paymentService.createPayment(
        sos_user_id,
        sos_subscription.dataValues.id,
        subscription?.dataValues.price,
        session.id,
      );
      if (subscription?.dataValues.members_count === 1) {
        ProtectedEntities.create({
          entity_id: sos_user_id,
          entity_type: 'sos_user',
          sos_user_subscription_id: sos_subscription.dataValues.id,
        });
      }
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
            { sessionId: session.id, subscription },
            201,
          ),
        );
    } catch (error) {
      console.error('Error creating agent:', error);
      return reply
        .status(500)
        .send(errorResponse('Internal server error.', 500));
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
      const sos_user_subscription = await SosUserSubscription.findOne({
        where: {
          stripe_cus_id: customer_id,
        },
      });
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
      const sos_user_subscription = await SosUserSubscription.findOne({
        where: {
          stripe_cus_id: session.customer,
        },
      });
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

    return reply
      .status(200)
      .send(successResponse('Webhook received successfully!', {}, 200));
  }
}
export default new SubscriptionController();
