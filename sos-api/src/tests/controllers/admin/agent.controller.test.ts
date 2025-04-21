import supertest from 'supertest';
import fastify from '../../globalTestSetup';
import AgentService from '../../../services/admin/agent.service';
import { Agent } from '../../../models';

let token = '';
let agentId = '';

describe('Agent Controller Tests', () => {
  beforeAll(async () => {
    const response = await supertest(fastify.server).post('/login/admin').send({
      email: 'admin@example.com',
      password: 'Admin@123',
    });
    expect(response.status).toBe(200);
    token = response.body.data.token;
  });

  // describe('Tests agent not found', () => {
  //   test('GET /admin/agents - Should return 404', async () => {
  //     const response = await supertest(fastify.server)
  //       .get('/admin/agents')
  //       .set('Authorization', `Bearer ${token}`);
  //     expect(response.status).toBe(404);
  //   });
  // });

  describe('Test the root path', () => {
    test('It should response to GET method', async () => {
      const response = await supertest(fastify.server).get('/');
      expect(response.status).toBe(404);
    });
  });

  test('POST /admin/agents - Should create a new agent', async () => {
    const response = await supertest(fastify.server)
      .post('/admin/agents')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example1.com',
        phone_number: '+12344248478',
        date_of_birth: new Date('1990-01-01T00:00:00Z'),
        password: 'Password@123',
      })
      .set('Authorization', `Bearer ${token}`);
    agentId = response.body.data.id;
    expect(response.status).toBe(201);
  });

  test('GET /admin/agents - Should return a list of agents', async () => {
    const response = await supertest(fastify.server).get('/admin/agents').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  test('PUT /admin/agents/:id - Should update an agent', async () => {
    const response = await supertest(fastify.server)
      .put('/admin/agents/' + agentId)
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example1.com',
        phone_number: '+12344248478',
        date_of_birth: new Date('1990-01-01T00:00:00Z'),
        password: 'Password@123',
      })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  test('GET /admin/agents/:id - Should get a single agent', async () => {
    const response = await supertest(fastify.server)
      .get('/admin/agents/' + agentId)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  describe('GET /admin/agents - Should return 500 on error', () => {
    beforeAll(() => {
      jest.spyOn(AgentService, 'getAllAgents').mockImplementation(() => {
        throw new Error('Simulated DB failure');
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    test('Should return 500 if service throws error', async () => {
      const response = await supertest(fastify.server).get('/admin/agents').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      const body = JSON.parse(response.text);
      expect(body.status).toBe('error');
      expect(body.message).toBe('Internal server error.');
    });
  });

  describe('GET /admin/agents/:id - Should return 500 on error', () => {
    beforeAll(() => {
      jest.spyOn(AgentService, 'getAgentById').mockImplementation(() => {
        throw new Error('Internal server error.');
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    test('Should return 500 if service throws error', async () => {
      const response = await supertest(fastify.server)
        .get('/admin/agents/' + agentId)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      const body = JSON.parse(response.text);
      expect(body.status).toBe('error');
      expect(body.message).toBe('Internal server error.');
    });
  });

  describe('PUT /admin/agents/:id - Should return 500 on error', () => {
    beforeAll(() => {
      jest.spyOn(AgentService, 'updateAgent').mockImplementation(() => {
        throw new Error('Internal server error.');
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    test('Should return 500 if service throws error', async () => {
      const response = await supertest(fastify.server)
        .put('/admin/agents/' + agentId)
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example1.com',
          phone_number: '+12344248478',
          date_of_birth: new Date('1990-01-01T00:00:00Z'),
          password: 'Password@123',
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      const body = JSON.parse(response.text);
      expect(body.status).toBe('error');
      expect(body.message).toBe('Internal server error.');
    });
  });

  describe('PUT /admin/agents/:id - Should return 404 agent not found', () => {
    beforeAll(() => {
      jest.spyOn(AgentService, 'updateAgent').mockImplementation(() => {
        throw new Error('Agent not found');
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    test('Should return 404 if service throws error', async () => {
      const response = await supertest(fastify.server)
        .put('/admin/agents/' + agentId)
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example1.com',
          phone_number: '+12344248478',
          date_of_birth: new Date('1990-01-01T00:00:00Z'),
          password: 'Password@123',
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      const body = JSON.parse(response.text);
      expect(body.status).toBe('error');
      expect(body.message).toBe('Agent not found');
    });
  });

  describe('PUT /admin/agents/:id - Should return 404 user not found', () => {
    beforeAll(() => {
      jest.spyOn(AgentService, 'updateAgent').mockImplementation(() => {
        throw new Error('User not found');
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    test('Should return 404 if service throws error', async () => {
      const response = await supertest(fastify.server)
        .put('/admin/agents/' + agentId)
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example1.com',
          phone_number: '+12344248478',
          date_of_birth: new Date('1990-01-01T00:00:00Z'),
          password: 'Password@123',
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      const body = JSON.parse(response.text);
      expect(body.status).toBe('error');
      expect(body.message).toBe('User not found');
    });
  });
});
