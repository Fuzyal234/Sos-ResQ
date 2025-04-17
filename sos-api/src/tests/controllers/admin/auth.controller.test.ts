import supertest from 'supertest';
import fastify from '../../globalTestSetup';
import AgentService from '../../../services/admin/agent.service';
import { Agent, User } from '../../../models';
import argon2 from 'argon2';

let token: string;

describe('Agent Auth Controller Tests', () => {
  beforeAll(async () => {
    const response = await supertest(fastify.server).post('/login/admin').send({
      email: 'admin@example.com',
      password: 'Admin@123',
    });
    expect(response.status).toBe(200);
    token = response.body.data.token;
  });

  test('POST /admin/change-password - Should change password', async () => {
    const response = await supertest(fastify.server)
      .post('/admin/change-password')
      .send({
        old_password: 'Admin@123',
        new_password: 'Admin@1234',
      })
      .set('Authorization', `Bearer ${token}`);
    console.log('response123 :>> ', response.body);
    expect(response.status).toBe(200);
  });
});
