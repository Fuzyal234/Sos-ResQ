import supertest from 'supertest';
import fastify from '../../globalTestSetup';

// Mock the redis service before any imports
jest.mock('../../../services/redis.service', () => ({
  getUserRoom: jest.fn().mockResolvedValue('testRoomId'),
  getChatHistory: jest.fn().mockResolvedValue([
    {
      sender: 'user1',
      content: 'Hello',
      timestamp: Date.now(),
      id: 'msg1',
      readStatus: false,
    },
    {
      sender: 'user2',
      content: 'Hi',
      timestamp: Date.now(),
      id: 'msg2',
      readStatus: true,
    },
  ]),
  close: jest.fn().mockResolvedValue(undefined),
}));

let token = '';
describe('Chat Controller Tests', () => {
  beforeAll(async () => {
    const response = await supertest(fastify.server).post('/signup').send({
      first_name: 'Haydar',
      last_name: 'Ali',
      email: 'haydarchat.ali@devflovv.com',
      phone_number: '+12344248451',
      password: 'Password@123',
    });
    console.log('response.body in the chat controller:>> ', response.body);
    token = response.body.data.token;
    expect(response.status).toBe(201);
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe('GET /user/chat-history', () => {
    test('Should return chat history when room exists', async () => {
      const response = await supertest(fastify.server)
        .get('/user/chat-history')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('readStatus');
    });

    test('Should return 404 when room is not found', async () => {
      // Mock getUserRoom to return null
      const redisService = require('../../../services/redis.service');
      redisService.getUserRoom.mockResolvedValueOnce(null);

      const response = await supertest(fastify.server)
        .get('/user/chat-history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Room not found');
      expect(response.body.code).toBe(404);
    });

    test('Should return 500 when there is an internal server error', async () => {
      // Mock getChatHistory to throw an error
      const redisService = require('../../../services/redis.service');
      redisService.getChatHistory.mockRejectedValueOnce(
        new Error('Database error'),
      );

      const response = await supertest(fastify.server)
        .get('/user/chat-history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Internal server error');
      expect(response.body.code).toBe(500);
    });
  });
});
