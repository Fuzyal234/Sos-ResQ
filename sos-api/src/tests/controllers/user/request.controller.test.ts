import supertest from 'supertest';
import fastify from '../../globalTestSetup';

let token = '';

describe('Request Controller Tests', () => {
  beforeAll(async () => {
    const response = await supertest(fastify.server).post('/signup').send({
      first_name: 'Haydar',
      last_name: 'Ali',
      email: 'haydarrequest.ali@devflovv.com',
      phone_number: '+12344248451',
      password: 'Password@123',
    });
    token = response.body.data.token;
  });
  test('POST /user/requests - Should create a new request', async () => {
    const response = await supertest(fastify.server)
      .post('/user/requests')
      .send({
        longitude: 80,
        latitude: 80,
      })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(201);
  });
});
