import supertest from 'supertest';
import fastify from '../../globalTestSetup';
import SubscriptionService from '../../../services/admin/subscription.service';
import {CreateSubscriptionDTO} from '../../../types/subscription.dto';
import {Subscription} from '../../../models/subscription.model';
import {SosUser} from '../../../models';

// Mock the stripe service
jest.mock('../../../services/stripe.service', () => ({
  __esModule: true,
  default: {
    createCheckoutSession: jest.fn().mockImplementation(() => {
      return {
        id: 'test_session_id_1234',
        url: 'https://test-checkout-url.com',
      };
    }),
  },
}));

let token = '';
let subscription_id = '';
let completeProfileToken = '';

describe('Subscription Controller 404 Test', () => {
  beforeAll(async () => {
    await Subscription.destroy({where: {}, force: true});

    const response = await supertest(fastify.server).post('/signup').send({
      first_name: 'Haydar',
      last_name: 'Ali',
      email: 'haydar404test.ali@devflovv.com',
      phone_number: '+12344248999',
      password: 'Password@123',
    });
    expect(response.status).toBe(201);
    token = response.body.data.token;
  });

  test('GET /subscriptions - Should give 404 response because no subscription available', async () => {
    const response = await supertest(fastify.server)
      .get('/subscriptions')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
  });
});

describe('Subscription Controller Tests', () => {
  beforeAll(async () => {
    const response = await supertest(fastify.server).post('/signup').send({
      first_name: 'Haydar',
      last_name: 'Ali',
      email: 'haydarsubscription.ali@devflovv.com',
      phone_number: '+12344248476',
      password: 'Password@123',
    });
    expect(response.status).toBe(201);
    token = response.body.data.token;

    const completeProfileResponse = await supertest(fastify.server)
      .post('/signup')
      .send({
        first_name: 'Complete',
        last_name: 'Profile',
        email: 'complete.profile@devflovv.com',
        phone_number: '+12344248222',
        password: 'Password@123',
      });
    expect(completeProfileResponse.status).toBe(201);
    completeProfileToken = completeProfileResponse.body.data.token;

    const userProfile = completeProfileResponse.body.data.user;
    await SosUser.update(
      {is_profile_completed: true},
      {where: {id: userProfile.user_id}},
    );

    const subscriptionData: CreateSubscriptionDTO = {
      name: 'Basic Plan',
      description: 'Basic subscription plan with limited features',
      includes_house: false,
      includes_car: false,
      members_count: 1,
      price: 9.99,
      stripe_price_id: 'price_test_1',
      stripe_product_id: 'prod_test_1',
    };

    const subscriptionData2: CreateSubscriptionDTO = {
      name: 'Premium Plan',
      description: 'Premium subscription plan with all features',
      includes_house: true,
      includes_car: true,
      members_count: 5,
      price: 29.99,
      stripe_price_id: 'price_test_2',
      stripe_product_id: 'prod_test_2',
    };

    await SubscriptionService.createSubscription(subscriptionData);
    await SubscriptionService.createSubscription(subscriptionData2);
  });

  test('GET /subscriptions - Should get all subscriptions', async () => {
    const response = await supertest(fastify.server)
      .get('/subscriptions')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    subscription_id = response.body.data[0].id;
  });

  test('POST /user/subscribe - Should handle exception of profile not complete', async () => {
    const response = await supertest(fastify.server)
      .post(`/user/subscribe`)
      .send({
        subscription_id: subscription_id,
        auto_renewal: true,
      })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
  });

  test('POST /user/subscribe - Should successfully create subscription for completed profile', async () => {
    const response = await supertest(fastify.server)
      .post(`/user/subscribe`)
      .send({
        subscription_id: subscription_id,
        auto_renewal: true,
      })
      .set('Authorization', `Bearer ${completeProfileToken}`);

    console.log('Subscribe response:', response.body);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('You have subscribed successfully!');
    expect(response.body.data.sessionId).toBe('test_session_id_1234');
  });
});
