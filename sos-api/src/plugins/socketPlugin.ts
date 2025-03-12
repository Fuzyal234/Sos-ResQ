// import { FastifyPluginAsync } from 'fastify';
// import { Server as SocketIOServer } from 'socket.io';

// const socketPlugin: FastifyPluginAsync = async (fastify) => {
//     const io = new SocketIOServer(fastify.server, {
//         cors: {
//             origin: '*', // Allow all origins, change as needed
//             methods: ['GET', 'POST'],
//         },
//     });
//     // Decorate Fastify with Socket.IO instance

//     fastify.decorate('io', io);
//     fastify.io.emit('user', 'hello');

//     fastify.io.on('connection', (socket) => {
//         console.log(`Client connected: ${socket.id}`);

//         socket.on('message', (data) => {
//             console.log(`Received message from ${socket.id}:`, data);
//             socket.broadcast.emit('message', data);
//         });

//         socket.on('disconnect', () => {
//             console.log(`Client disconnected: ${socket.id}`);
//         });
//     });

// };

// export default socketPlugin;


import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { Server, ServerOptions } from 'socket.io'
import jwt from 'jsonwebtoken'
import socketService from '../services/socket.service'

export type FastifySocketioOptions = Partial<ServerOptions> & {
  preClose?: (done: Function) => void
}

const socketPlugin: FastifyPluginAsync<FastifySocketioOptions> = fp(
  async function (fastify, opts: FastifySocketioOptions) {
    function defaultPreClose(done: Function) {
      (fastify as any).io.local.disconnectSockets(true)
      done()
    }

    fastify.decorate('io', new Server(fastify.server, opts))

    fastify.io.on('connection', (socket) => {

      console.log(`Client connected: ${socket.id}`)

      const token = socket.handshake.headers.authorization?.split(' ')[1];
      console.log('token :>> ', token);
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET || "devflovvdevflovvdevflovv", (err: any) => {
          if (err) {
            return socket.emit('error', { message: 'Invalid token' });
          }
        });
        const decoded = jwt.decode(token);
        console.log('decoded :>> ', decoded);
        if (decoded) {
          socket.data.user = decoded.user_id;
          socket.data.role = decoded.role;
        }

        socketService.registerSocketEvents(socket, fastify.io)

        if (socket.data.role === 'agent') {
          socket.join('room_agent_notifications');
        }
      }

    })
    // fastify.io.on("message", (data) => {
    //   console.log(`Received message from ):`, data);
    //   fastify.io.emit('message', data);
    // });
    fastify.addHook('preClose', (done) => {
      if (opts.preClose) {
        return opts.preClose(done)
      }
      return defaultPreClose(done)
    })
    fastify.addHook('onClose', (fastify: FastifyInstance, done) => {
      (fastify as any).io.close()
      done()
    })
  },
)

export default socketPlugin
