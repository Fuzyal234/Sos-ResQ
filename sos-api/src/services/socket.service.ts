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

class SocketService {
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

      const agentSockets = new Map();

      for (const agent of availableAgents) {
        const agentSocket = agentsRoom.get(agent.dataValues.id);
        if (agentSocket) {
          agentSockets.set(agent.id, agentSocket);
        }
      }

      for (const agentSocket of agentSockets) {
        agentSocket[1].send(JSON.stringify({ sos_user_id: sos_user_id }));
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
    const userSocket = userSockets.get(userId);
    const agentSocket = agentSockets.get(agentId);

    if (userSocket && agentSocket) {
      userSocket.send(JSON.stringify({ type: 'assigned', agentId }));
      agentSocket.send(JSON.stringify({ type: 'assigned', userId }));

      Agent.update({ status: 'busy' }, { where: { user_id: agentId } });

      userSocket.on('message', (msg: Buffer) => {
        const textMessage = msg.toString('utf-8');
        agentSocket.send(textMessage);
      });

      agentSocket.on('message', (msg: Buffer) => {
        const textMessage = msg.toString('utf-8');
        userSocket.send(textMessage);
      });
    }
  }

  public async registerSocketEvents(socket: Socket, io: Server) {
    socket.on('message', data => {
      io.emit('message', data);
    });

    socket.on('send_message', async data => {
      let data_json;
      try {
        data_json = JSON.parse(data);
      } catch (error) {
        data_json = data;
      }
      data = data_json;
      const { sender_id, message } = data;
      const { user, role } = socket.data;

      if (!message || !sender_id || !user) return;

      const room_id =
        role === 'agent'
          ? await redisService.getAgentRoom(user)
          : await redisService.getUserRoom(user);

      if (!room_id) return;

      const members = io.sockets.adapter.rooms.get(room_id);
      if (!members || !members.has(socket.id)) return;

      // Save message to Redis
      await redisService.saveChatMessage(room_id, {
        sender: role,
        content: message,
        timestamp: Date.now(),
      });

      socket.to(room_id).emit('receive_message', {
        sender: role,
        message,
        timeStamp: Date.now(),
      });
    });

    socket.on('get_chat_history', async data => {
      const { user, role } = socket.data;
      const room_id =
        role === 'agent'
          ? await redisService.getAgentRoom(user)
          : await redisService.getUserRoom(user);
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
          redisService.removeAgentRoom(socket.data.user);
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
          redisService.removeUserRoom(socket.data.user);
        });
      }
    });
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
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
        const members_set = io.sockets.adapter.rooms.get(room_id);

        if (members_set && members_set.size < 2) {
          redisService.setAgentRoom(socket.data.user, room_id);
          socket.join(room_id);
          socket.to(room_id).emit('connected_to_sos_user', room_id);
          socket
            .to('room_agent_notifications')
            .emit('request_handled', { request_id: request_id });
        }
      });
    }
    socket.on('leave_room', async data => {
      const { room_id } = JSON.parse(data) as { room_id: string };
      const members = io.sockets.adapter.rooms.get(room_id);

      if (members?.has(socket.id)) socket.leave(room_id);
    });
  }

  public async createChatRoom(sos_user_id: string): Promise<string> {
    const room_id = `room_${sos_user_id}`;
    // activeChats[sos_user_id] = {  room_id }
    return room_id;
  }

  public async getRoomId(sos_user_id: string): Promise<string | undefined> {
    return activeChats[sos_user_id]?.room_id;
  }
}

export default new SocketService();
export const activeChats: ActiveChats = {};
