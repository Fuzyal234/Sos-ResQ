import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Server, ServerOptions } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import socketService from '../services/socket.service';
import redisService from '../services/redis.service';

export type FastifySocketioOptions = Partial<ServerOptions> & {
  preClose?: (done: Function) => void;
};

const socketPlugin: FastifyPluginAsync<FastifySocketioOptions> = fp(
  async function (fastify, opts: FastifySocketioOptions) {
    function defaultPreClose(done: Function) {
      (fastify as any).io.local.disconnectSockets(true);
      done();
    }

    fastify.decorate('io', new Server(fastify.server, opts));

    fastify.io.on('connection', async socket => {
      console.log(`Client connected: ${socket.id}`);

      const token = socket.handshake.headers.authorization?.split(' ')[1];
      console.log('token :>> ', token);
      if (token) {
        jwt.verify(
          token,
          process.env.JWT_SECRET || 'devflovvdevflovvdevflovv',
          (err: any) => {
            if (err) {
              socket.disconnect(true);
              return socket.emit('error', { message: 'Invalid token' });
            }
          },
        );
        const decoded = jwt.decode(token) as JwtPayload;
        console.log('decoded :>> ', decoded);
        if (decoded) {
          socket.data.user = decoded.user_id;
          socket.data.role = decoded.role;
        }
        console.log('socket.data :>> ', socket.data);
        if (socket.data.role === 'sos_user') {
          if (decoded) {
            socket.data.user = decoded.sos_user_id;
          }
          console.log(
            'saving the user socket in redis',
            socket.data.user,
            socket.id,
          );
          redisService.setUserSocket(socket.data.user, socket.id);
          const room = await redisService.getUserRoom(socket.data.user);
          console.log('room :>> ', room);
          if (room) {
            socket.join(room);
            socket.emit('connected_to_sos_user', room);
            socket.to(room).emit('connected_to_sos_user', room);
          }
        }
        socketService.registerSocketEvents(socket, fastify.io);
        console.log('socket.data :>> ', socket.data);
        if (socket.data.role === 'agent') {
          console.log(
            'saving the agent socket in redis',
            socket.data.user,
            socket.id,
          );
          socket.join('room_agent_notifications');
          redisService.setAgentSocket(socket.data.user, socket.id);
          const room = await redisService.getAgentRoom(socket.data.user);
          console.log('room :>> ', room);
          if (room) {
            socket.join(room);
          }
        }
      }
    });
    // fastify.io.on("message", (data) => {
    //   console.log(`Received message from ):`, data);
    //   fastify.io.emit('message', data);
    // });
    fastify.addHook('preClose', done => {
      if (opts.preClose) {
        return opts.preClose(done);
      }
      return defaultPreClose(done);
    });
    fastify.addHook('onClose', (fastify: FastifyInstance, done) => {
      (fastify as any).io.close();
      done();
    });
  },
);

export default socketPlugin;
