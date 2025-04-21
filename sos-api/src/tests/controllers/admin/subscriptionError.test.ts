import supertest from 'supertest';
import fastify from '../../globalTestSetup';
import exp from 'constants';
import { v4 as uuidv4 } from 'uuid';

let token = '';
let subscriptionId = '';

// Mock the subscription service
jest.mock('../../../services/admin/subscription.service', () => ({
  __esModule: true,
  default: {
    getAllSubscriptions: jest.fn(),
    getSubscriptionById: jest.fn(),
    createSubscription: jest.fn(),
    updateSubscription: jest.fn(),
    deleteSubscription: jest.fn(),
  },
}));

describe('Admin Subscription Controller Errors Tests', () => {
  let subscriptionService: any;
  let Subscription: any;

  beforeAll(async () => {
    const response = await supertest(fastify.server).post('/login/admin').send({
      email: 'admin@example.com',
      password: 'Admin@123',
    });
    expect(response.status).toBe(200);
    token = response.body.data.token;
    // Get the mocked service
    subscriptionService = jest.requireMock('../../../services/admin/subscription.service').default;

    Subscription = jest.requireMock('../../../models/subscription.model').default;
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
  });

  afterAll(() => {
    // Restore all mocks after all tests
    jest.restoreAllMocks();
  });

  test('GET /admin/subscriptions - Should return 500 on error', async () => {
    // Mock the service to throw an error
    subscriptionService.getAllSubscriptions.mockRejectedValueOnce(new Error('Database error'));

    const response = await supertest(fastify.server)
      .get('/admin/subscriptions')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(500);
  });

  test('GET /admin/subscriptions - Shoud return 404 error', async () => {
    subscriptionService.getAllSubscriptions.mockResolvedValueOnce([]);

    const response = await supertest(fastify.server)
      .get('/admin/subscriptions')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
  });

  test('GET /admin/subscriptions - Shoud return 404 error', async () => {
    subscriptionService.getAllSubscriptions.mockResolvedValueOnce([]);

    const response = await supertest(fastify.server)
      .get('/admin/subscriptions')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
  });

  test('GET /admin/subscription/:id - Shoud reurn 400 ', async () => {
    subscriptionService.getSubscriptionById.mockRejectedValueOnce([]);
    const id = uuidv4();
    const response = await supertest(fastify.server)
      .get(`/admin/subscription/:${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
  });

  test('PUT /admin/subscripton/:id - Should return 500', async () => {
    subscriptionService.getSubscriptionById.mockResolvedValueOnce({
      id: 1,
      name: 'Basic',
      members_count: 1,
      includes_car: false,
      includes_house: false,
      monthly_price: 45,
      yearly_price: 45,
      description: 'This is a basic plan',
    });
    subscriptionService.updateSubscription.mockRejectedValueOnce(Error('Error updating Subscription'));

    const response = await supertest(fastify.server)
      .put(`/admin/subscription/:${subscriptionId}`)
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
    console.log('response.body in errors:>> ', response.body);
    expect(response.status).toBe(500);
  });

  test('GET /admin/subscriptions/:id - Should return 500 error', async () => {
    subscriptionService;
  });
});
