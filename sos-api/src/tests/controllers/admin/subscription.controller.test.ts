import supertest from 'supertest';
import fastify from '../../globalTestSetup';

let token = '';

describe('Admin Subscription Controller Tests', () => {
  beforeAll(async () => {
    const response = await supertest(fastify.server).post('/login/admin').send({
      email: 'admin@example.com',
      password: 'Admin@123',
    });
    expect(response.status).toBe(200);
    token = response.body.data.token;
  });

  let subscriptionId = '';
  test('POST /admin/subscriptions - Should create a new subscription', async () => {
    const response = await supertest(fastify.server)
      .post('/admin/subscriptions')
      .send({
        name: 'Basic',
        members_count: 1,
        includes_car: false,
        includes_house: false,
        monthly_price: 45,
        yearly_price: 45,
        description: 'This is a basic plan',
      })
      .set('Authorization', `Bearer ${token}`);
    console.log('response in subscription controller tests:>> ', response.body);
    subscriptionId = response.body.data.subscription.id;
    expect(response.status).toBe(201);
  });

  test('GET /admin/subscriptions - Should get all subscriptions', async () => {
    const response = await supertest(fastify.server)
      .get('/admin/subscriptions')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  test('GET /admin/subscription/:id - Should get a single subscription', async () => {
    const response = await supertest(fastify.server)
      .get(`/admin/subscription/${subscriptionId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  test('PUT /admin/subscription/:id - Should update a subscription', async () => {
    const response = await supertest(fastify.server)
      .put(`/admin/subscription/${subscriptionId}`)
      .send({
        name: 'Basic',
        members_count: 1,
        includes_car: false,
        includes_house: false,
        monthly_price: 45,
        yearly_price: 45,
        description: 'This is a basic plan',
      })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});
