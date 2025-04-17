import supertest from 'supertest';
import fastify from '../../globalTestSetup';
import AgentService from '../../../services/admin/agent.service';
import { Agent, User } from '../../../models';
import argon2 from 'argon2';

let token, agentToken: string;
let agentId, userId;

describe('Agent Auth Controller Tests', () => {
  beforeAll(async () => {
    const response = await supertest(fastify.server).post('/login/admin').send({
      email: 'admin@example.com',
      password: 'Admin@123',
    });
    expect(response.status).toBe(200);
    token = response.body.data.token;
    let passwordHash = await argon2.hash('Password@123');
    const user = await User.create({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@exampleagentauthtest.com',
      phone_number: '+123442876478',
      date_of_birth: new Date('1990-01-01T00:00:00Z'),
      role: 'agent',
      password: passwordHash,
    });
    userId = user.dataValues.id;

    const agent = await Agent.create({
      first_name: 'JohnAgent',
      last_name: 'Doe',
      user_id: userId,
      email: 'john@exampleagentauthtest.com',
      phone_number: '+123442876478',
      date_of_birth: new Date('1990-01-01T00:00:00Z'),
      password: passwordHash,
    });
    agentId = agent.id;

    const response2 = await supertest(fastify.server).post('/login/agent').send({
      email: 'john@exampleagentauthtest.com',
      password: 'Password@123',
    });
    console.log('response2 :>> ', response2.body);
    expect(response2.status).toBe(200);
    agentToken = response2.body.data.token;
  });

  test('POST /login/agent - Should login a agent', async () => {
    const response = await supertest(fastify.server).post('/login/agent').send({
      email: 'john@exampleagentauthtest.com',
      password: 'Password@123',
    });
    expect(response.status).toBe(200);
  });

  test('POST /agent/change-password - Should change password', async () => {
    const response = await supertest(fastify.server)
      .post('/agent/change-password')
      .send({
        old_password: 'Password@123',
        new_password: 'Password@1234',
      })
      .set('Authorization', `Bearer ${agentToken}`);
    console.log('response123 :>> ', response.body);
    expect(response.status).toBe(200);
  });
});
