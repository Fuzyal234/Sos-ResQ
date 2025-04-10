import { Agent } from '../models';
import { agentsRoom } from '../routes/agent/agent.routes';
import { UUID } from 'crypto';
import { SosRequestDTO } from '../types/request.dto';

class RedisService {
  private static instance: RedisService;
  private sosQueue: any;
  private connection: any;
  private isConnected: boolean = false;

  private constructor() {
    const { Queue, Worker } = require('bullmq');
    const Redis = require('ioredis');

    // Use localhost for testing environment
    const isTest = process.env.NODE_ENV === 'test';
    const redisHost = isTest ? 'localhost' : process.env.REDIS_HOST || 'redis';

    this.connection = new Redis({
      host: redisHost,
      port: process.env.REDIS_PORT || 6379,
    });

    this.sosQueue = new Queue('sos-queue', { connection: this.connection });

    this.connection.on('connect', () => {
      if (!this.isConnected) {
        console.log('Connected to Redis');
        this.isConnected = true;
      }
    });

    this.connection.on('error', (err: Error) => {
      console.error('Redis Error:', err);
      this.isConnected = false;
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async close() {
    if (this.sosQueue) {
      await this.sosQueue.close();
    }
    if (this.connection) {
      await this.connection.quit();
    }
    this.isConnected = false;
  }

  public async addToQueue(sos_request: SosRequestDTO) {
    await this.sosQueue.add('sos_request', sos_request);
  }

  public async getWaiting() {
    const jobs = await this.sosQueue.getWaiting();
    return jobs;
  }

  public async removeJobFromQueue(sos_user_id: UUID) {
    const jobs = await this.sosQueue.getWaiting();
    const job = jobs.find(
      (job: { data: { sos_user_id: UUID } }) =>
        job.data.sos_user_id === sos_user_id,
    );
    if (job) {
      await job.remove();
    }
  }

  /**
   * Notify available agents
   * @param agentId Agent ID
   */
  public async notifyAvailableAgents(sos_user_id: UUID) {
    try {
      const availableAgents = await Agent.findAll({
        where: { status: 'available' },
        attributes: ['user_id'],
      });

      const agentSockets = new Map();

      for (const agent of availableAgents) {
        const agentSocket = agentsRoom.get(agent.dataValues.user_id);
        if (agentSocket) {
          agentSockets.set(agent.user_id, agentSocket);
        }
      }

      for (const agentSocket of agentSockets) {
        agentSocket[1].send(JSON.stringify({ sos_user_id: sos_user_id }));
      }
    } catch (error) {
      console.error('Error notifying available agents:', error);
    }
  }

  public async setUserRoom(userId: string, roomId: string): Promise<void> {
    await this.connection.set(`user_room:${userId}`, roomId);
  }

  public async getUserRoom(userId: string): Promise<string | null> {
    return await this.connection.get(`user_room:${userId}`);
  }

  public async removeUserRoom(userId: string): Promise<void> {
    await this.connection.del(`user_room:${userId}`);
  }

  public async setAgentRoom(agentId: string, roomId: string): Promise<void> {
    await this.connection.set(`agent_room:${agentId}`, roomId);
  }

  public async getAgentRoom(agentId: string): Promise<string | null> {
    return await this.connection.get(`agent_room:${agentId}`);
  }

  public async removeAgentRoom(agentId: string): Promise<void> {
    await this.connection.del(`agent_room:${agentId}`);
  }

  public async setUserSocket(userId: string, socketId: string): Promise<void> {
    await this.connection.set(`user_socket:${userId}`, socketId);
  }

  public async getUserSocket(userId: string): Promise<string | null> {
    return await this.connection.get(`user_socket:${userId}`);
  }

  public async removeUserSocket(userId: string): Promise<void> {
    await this.connection.del(`user_socket:${userId}`);
  }
  public async setUsersInRoom(
    roomId: string,
    userIds: string[],
  ): Promise<void> {
    await this.connection.sadd(`room:${roomId}`, ...userIds);
  }

  public async getUsersInRoom(roomId: string): Promise<string[] | null> {
    const members = await this.connection.smembers(`room:${roomId}`);
    return members.length ? members : null;
  }

  public async removeUsersInRoom(roomId: string): Promise<void> {
    const key = `room:${roomId}`;
    const userIds = await this.connection.smembers(key);

    for (const userId of userIds) {
      await this.removeUserRoom(userId);
      await this.removeUserSocket(userId);
    }

    await this.connection.del(key);
  }

  public async setAgentSocket(
    agentId: string,
    socketId: string,
  ): Promise<void> {
    await this.connection.set(`agent_socket:${agentId}`, socketId);
  }

  public async getAgentSocket(agentId: string): Promise<string | null> {
    return await this.connection.get(`agent_socket:${agentId}`);
  }

  public async removeAgentSocket(agentId: string): Promise<void> {
    await this.connection.del(`agent_socket:${agentId}`);
  }

  /**
   * Save a chat message to Redis
   * @param roomId The chat room ID
   * @param message The message object containing sender, content, timestamp, id and read status
   */
  public async saveChatMessage(
    roomId: string,
    message: {
      sender: string;
      content: string;
      timestamp: number;
      id: string;
      readStatus: boolean;
    },
  ): Promise<void> {
    const messageKey = `chat:${roomId}`;
    await this.connection.rpush(messageKey, JSON.stringify(message));
  }

  /**
   * Get chat history for a room with pagination
   * @param roomId The chat room ID
   * @param page The page number (1-based)
   * @param limit Number of messages per page
   */
  public async getChatHistory(
    roomId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<
    Array<{
      sender: string;
      content: string;
      timestamp: number;
      id: string;
      readStatus: boolean;
    }>
  > {
    const messageKey = `chat:${roomId}`;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const messages = await this.connection.lrange(messageKey, start, end);
    return messages.map((msg: string) => JSON.parse(msg));
  }

  /**
   * Mark a message as read in a chat room
   * @param roomId The chat room ID
   * @param messageId The ID of the message to mark as read
   */
  public async markMessageAsRead(
    roomId: string,
    messageId: string,
  ): Promise<void> {
    const messageKey = `chat:${roomId}`;
    const messages = await this.connection.lrange(messageKey, 0, -1);

    for (let i = 0; i < messages.length; i++) {
      const message = JSON.parse(messages[i]);
      if (message.id === messageId) {
        message.readStatus = true;
        await this.connection.lset(messageKey, i, JSON.stringify(message));
        break;
      }
    }
  }

  /**
   * Get total number of messages in a chat room
   * @param roomId The chat room ID
   */
  public async getChatMessageCount(roomId: string): Promise<number> {
    const messageKey = `chat:${roomId}`;
    return await this.connection.llen(messageKey);
  }

  /**
   * Clear chat history for a room
   * @param roomId The chat room ID
   */
  public async clearChatHistory(roomId: string): Promise<void> {
    const messageKey = `chat:${roomId}`;
    await this.connection.del(messageKey);
  }
}

export default RedisService.getInstance();
