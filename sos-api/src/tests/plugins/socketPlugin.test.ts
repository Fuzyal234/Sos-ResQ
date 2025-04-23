// socketPlugin.test.ts
import supertest, { agent } from 'supertest';
import fastify from '../globalTestSetup';
import { Server, ServerOptions } from 'socket.io';
import { io as createClient } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import redisService from '../../services/redis.service';
import { UUID } from 'crypto';

jest.mock('../../services/redis.service');

let token: string;
let adminToken: string;
let agentId: string;
let agentToken: string;
let room_id: string;
let sosUserId: string;
let request_id: UUID;

interface MessageData {
  message: string;
}

interface ChatHistoryData {
  user: string;
}

describe('Socket.IO Plugin', () => {
  let io: Server;
  let clientSocket: any;
  let agentSocket: any;

  beforeAll(async () => {
    io = fastify.io;

    // Login as admin
    const responseAdmin = await supertest(fastify.server).post('/login/admin').send({
      email: 'admin@example.com',
      password: 'Admin@123',
    });
    console.log('logging admin');
    expect(responseAdmin.status).toBe(200);
    adminToken = responseAdmin.body.data.token;

    // Create an agent
    const responseAgentCreate = await supertest(fastify.server)
      .post('/admin/agents')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'johnsocket@example1.com',
        phone_number: '+13344248478',
        date_of_birth: new Date('1990-01-01T00:00:00Z'),
        password: 'Password@123',
      })
      .set('Authorization', `Bearer ${adminToken}`);
    agentId = responseAgentCreate.body.data.id;
    console.log('creating agent');
    expect(responseAgentCreate.status).toBe(201);

    // Login as agent
    const responseAgent = await supertest(fastify.server).post('/login/agent').send({
      email: 'johnsocket@example1.com',
      password: 'Password@123',
    });
    console.log('logging agent');
    console.log('responseAgent.body :>> ', responseAgent.body);
    agentToken = responseAgent.body.data.token;
    expect(responseAgent.status).toBe(200);

    // Create a test token
    const response = await supertest(fastify.server).post('/signup').send({
      first_name: 'Haydar',
      last_name: 'Ali',
      email: 'haydar1.alisocket@devflovv.com',
      phone_number: '+12334248461',
      password: 'Password@123',
    });
    token = response.body.data.token;
    sosUserId = response.body.data.user.user_id;
    console.log('response.body :>> ', response.body);
    expect(response.status).toBe(201);
  });

  afterAll(async () => {
    await fastify.close();
  });

  beforeEach(async () => {
    console.log('agent token', agentToken);
    agentSocket = createClient(`http://127.0.0.1:4444`, {
      transports: ['websocket'],
      extraHeaders: {
        authorization: `Bearer ${agentToken}`,
      },
      autoConnect: false,
      reconnection: false,
    });

    clientSocket = createClient(`http://127.0.0.1:4444`, {
      transports: ['websocket'],
      extraHeaders: {
        authorization: `Bearer ${token}`,
      },
      autoConnect: false,
      reconnection: false,
    });

    // agentSocket.on('connect', () => {
    //   console.log('agentSocket connected');
    //   agentSocket.on('sos_request_notification', (data: any) => {
    //     console.log('sos_request_notification', data);
    //     agentSocket.emit('connect_to_sos_user', data);
    //   });
    // });

    // clientSocket.on('connect', () => {
    //   clientSocket.on('connected_to_agent', (data: any) => {
    //     console.log('connected_to_agent', data);
    //   });
    // });

    const sosRequestResponse = await supertest(fastify.server)
      .post('/user/requests')
      .send({
        longitude: 80,
        latitude: 80,
      })
      .set('Authorization', `Bearer ${token}`);
    console.log('sosRequestResponse.body :>> ', sosRequestResponse.body);
    request_id = sosRequestResponse.body.data.sos_request.id;
    expect(sosRequestResponse.status).toBe(201);

    room_id = `room_${sosUserId}`;
    //create chatroom function is missing
    (redisService.setUserRoom as jest.Mock).mockResolvedValue(undefined);
    (redisService.getUserRoom as jest.Mock).mockResolvedValue(room_id);
    (redisService.getAgentRoom as jest.Mock).mockResolvedValue(room_id);
    (redisService.setAgentRoom as jest.Mock).mockResolvedValue(undefined);
    (redisService.saveChatMessage as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(async () => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  describe('Connection Event as sos_user', () => {
    it('should handle client connection as sos_user', done => {
      clientSocket.on('connect', () => {
        // The connection event is handled by the plugin
        // We can verify this by checking if the client is connected
        expect(clientSocket.connected).toBe(true);
        done();
      });
      clientSocket.connect();
      agentSocket.connect();
    }, 10000);
  });

  describe('Disconnect Event as sos_user', () => {
    it('should handle client disconnection as sos_user', done => {
      clientSocket.on('connect', () => {
        console.log('clientSocket.connected :>> ', clientSocket.connected);
        clientSocket.on('disconnect', () => {
          console.log('clientSocket.disconnected :>> ', clientSocket.connected);
          expect(clientSocket.connected).toBe(false);
          done();
        });
        clientSocket.disconnect();
      });
      clientSocket.connect();
      agentSocket.connect();
    }, 10000);
  });

  describe('Message Event', () => {
    it('should handle message events', done => {
      clientSocket.on('connect', () => {
        clientSocket.on('message', (message: string) => {
          expect(message).toBe('Hello, world!');
          done();
        });
        clientSocket.emit('message', 'Hello, world!');
      });
      clientSocket.connect();
      agentSocket.connect();
    }, 10000);
  });

  describe('Send Message Event', () => {
    it('should handle send message events', done => {
      // Connect both sockets first
      clientSocket.connect();
      agentSocket.connect();

      // Wait for both to be connected
      let clientConnected = false;
      let agentConnected = false;

      clientSocket.on('connect', () => {
        clientConnected = true;
        checkBothConnected();
      });

      agentSocket.on('connect', () => {
        agentConnected = true;
        checkBothConnected();
      });

      function checkBothConnected() {
        if (clientConnected && agentConnected) {
          // Now that both are connected, mock the connection to the SOS room
          agentSocket.on('receive_message', (data: MessageData) => {
            console.log('receive_message data :>> ', data);
            expect(data).toHaveProperty('message', 'Hello, world!');
            done();
          });

          // Manually simulate joining a room by sending a connection event
          agentSocket.emit('connect_to_sos_user', {
            room_id: room_id,
            sos_user_id: sosUserId,
            request_id: request_id,
          });

          // Give time for socket to process joining the room
          setTimeout(() => {
            clientSocket.emit('send_message', {
              message: 'Hello, world!',
              sender_id: sosUserId,
              user: 'test',
            });
          }, 300);
        }
      }
    }, 10000);
  });

  describe('Get Chat History Event', () => {
    it('should handle get chat history events', done => {
      // Mock the getChatHistory method to return test data
      const mockChatHistory = [
        {
          sender: 'sos_user',
          content: 'Test message',
          timestamp: Date.now(),
          id: 'test-id',
          readStatus: false,
        },
      ];
      (redisService.getChatHistory as jest.Mock).mockResolvedValue(mockChatHistory);

      // Connect both sockets first
      clientSocket.connect();
      agentSocket.connect();

      // Wait for client to be connected
      clientSocket.on('connect', () => {
        // Listen for chat_history event (not get_chat_history which is what we emit)
        clientSocket.on('chat_history', (data: any) => {
          expect(data).toEqual(mockChatHistory);
          done();
        });

        // Then emit the event to get chat history
        setTimeout(() => {
          clientSocket.emit('get_chat_history', { user: 'test' });
        }, 300);
      });
    }, 10000);
  });
});
