type ActiveChats = {
  [sos_user_id: string]: {
    agent_id: string;
    room_id: string;
  };
};

import { Agent } from '../models';
import { agentsRoom } from '../routes/agent/agent.routes';
import { UUID } from 'crypto';
import { userSockets } from '../routes/user/user.routes';
import { agentSockets } from '../routes/agent/agent.routes';
import { Server, Socket } from 'socket.io';
import { time, timeStamp } from 'console';
import redisService from './redis.service';
import SosRequest from '../models/sos_request.model';

class SocketService {
  private activeChats: ActiveChats = {};

  /**
   * Notify available agents
   * @param agentId Agent ID
   */
  public async notifyAvailableAgents(sos_user_id: UUID) {
    try {
      const availableAgents = await Agent.findAll({
        where: { status: 'available' },
        attributes: ['id'],
      });

      for (const agent of availableAgents) {
        const agentSocket = agentsRoom.get(agent.dataValues.id);
        if (agentSocket) {
          agentSocket.send(JSON.stringify({ sos_user_id }));
        }
      }
    } catch (error) {
      console.error('Error notifying available agents:', error);
    }
  }

  /**
   * Assign request to agent
   * @param userId User ID
   * @param agentId Agent ID
   */
  public async assignRequestToAgent(userId: UUID, agentId: UUID) {
    try {
      const userSocket = userSockets.get(userId);
      const agentSocket = agentSockets.get(agentId);

      if (!userSocket || !agentSocket) {
        throw new Error('User or agent socket not found');
      }

      userSocket.send(JSON.stringify({ type: 'assigned', agentId }));
      agentSocket.send(JSON.stringify({ type: 'assigned', userId }));

      await Agent.update({ status: 'busy' }, { where: { user_id: agentId } });

      userSocket.on('message', (msg: Buffer) => {
        const textMessage = msg.toString('utf-8');
        agentSocket.send(textMessage);
      });

      agentSocket.on('message', (msg: Buffer) => {
        const textMessage = msg.toString('utf-8');
        userSocket.send(textMessage);
      });
    } catch (error) {
      console.error('Error assigning request to agent:', error);
      throw error;
    }
  }

  public async registerSocketEvents(socket: Socket, io: Server) {
    try {
      socket.on('message', data => {
        io.emit('message', data);
      });

      socket.on('send_message', async data => {
        try {
          let data_json;
          try {
            data_json = JSON.parse(data);
          } catch (error) {
            data_json = data;
          }

          const { sender_id, message } = data_json;
          const { user, role } = socket.data;

          if (!message || !sender_id || !user) {
            console.warn('Invalid message data:', { sender_id, message, user });
            return;
          }

          const room_id =
            role === 'agent' ? await redisService.getAgentRoom(user) : await redisService.getUserRoom(user);

          if (!room_id) {
            console.warn('No room found for user:', user);
            return;
          }

          const members = io.sockets.adapter.rooms.get(room_id);
          if (!members || !members.has(socket.id)) {
            console.warn('Socket not in room:', {
              socketId: socket.id,
              room_id,
            });
            return;
          }

          const messageId = await this.createMessageId();
          await redisService.saveChatMessage(room_id, {
            sender: role,
            content: message,
            timestamp: Date.now(),
            id: messageId,
            readStatus: false,
          });

          socket.to(room_id).emit('receive_message', {
            id: messageId,
            sender: role,
            message,
            readStatus: false,
            timeStamp: Date.now(),
          });
        } catch (error) {
          console.error('Error in send_message event:', error);
        }
      });

      socket.on('get_chat_history', async data => {
        const { user, role } = socket.data;
        const room_id = role === 'agent' ? await redisService.getAgentRoom(user) : await redisService.getUserRoom(user);
        const messages = await redisService.getChatHistory(room_id as string);
        console.log('messages :>> ', messages);
        socket.emit('chat_history', messages);
      });

      socket.on('end_chat', async data => {
        if (socket.data.role === 'agent') {
          console.log('end chat triggered by agent');
          redisService.getAgentRoom(socket.data.user).then(room_id => {
            if (room_id) {
              socket.to(room_id).emit('agent_left', {
                timeStamp: Date.now(),
              });
              socket.leave(room_id);
            }
            redisService.clearChatHistory(room_id as string);
            redisService.removeUsersInRoom(room_id as string);
          });
        }

        if (socket.data.role === 'sos_user') {
          console.log('end chat triggered by sos user');
          redisService.getUserRoom(socket.data.user).then(room_id => {
            if (room_id) {
              socket.to(room_id).emit('user_left', {
                timeStamp: Date.now(),
              });
              socket.leave(room_id);
            }
            redisService.removeUsersInRoom(room_id as string);
          });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });

      socket.on('message_read', async data => {
        let data_json;
        try {
          data_json = JSON.parse(data);
        } catch (error) {
          data_json = data;
        }
        data = data_json;
        const { sender_id, message_id } = data;
        const { user, role } = socket.data;
        const room_id = role === 'agent' ? await redisService.getAgentRoom(user) : await redisService.getUserRoom(user);
        if (!room_id) return;
        const members = io.sockets.adapter.rooms.get(room_id);
        if (!members || !members.has(socket.id)) return;
        redisService.markMessageAsRead(room_id, message_id);
        socket.to(room_id).emit('message_read', { message_id });
      });

      if (socket.data.role === 'agent') {
        socket.on('connect_to_sos_user', async data => {
          let data_json;
          try {
            data_json = JSON.parse(data);
          } catch (error) {
            data_json = data;
          }
          data = data_json;

          const { room_id, request_id } = data as {
            room_id: string;
            request_id: string;
          };
          const request = await SosRequest.findOne({
            where: { id: request_id },
          });

          if (!request) {
            return;
          }
          await request.update({ status: 'in_progress' });
          const members_set = io.sockets.adapter.rooms.get(room_id);

          if (members_set && members_set.size < 2) {
            redisService.setAgentRoom(socket.data.user, room_id);
            redisService.setUsersInRoom(room_id, [socket.data.user]);
            socket.join(room_id);
            socket.to(room_id).emit('connected_to_sos_user', room_id);
            socket.to('room_agent_notifications').emit('request_handled', { request_id: request_id });
          }
        });
      }
      socket.on('leave_room', async data => {
        const { room_id } = JSON.parse(data) as { room_id: string };
        const members = io.sockets.adapter.rooms.get(room_id);

        if (members?.has(socket.id)) socket.leave(room_id);
      });
    } catch (error) {
      console.error('Error registering socket events:', error);
    }
  }

  public async createChatRoom(sos_user_id: string): Promise<string> {
    const room_id = `room_${sos_user_id}`;
    this.activeChats[sos_user_id] = { agent_id: '', room_id };
    return room_id;
  }

  public async createMessageId(): Promise<string> {
    return crypto.randomUUID();
  }

  public async getRoomId(sos_user_id: string): Promise<string | undefined> {
    return this.activeChats[sos_user_id]?.room_id;
  }
}

export default new SocketService();
