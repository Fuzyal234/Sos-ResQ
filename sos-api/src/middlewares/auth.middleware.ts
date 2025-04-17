import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../helper/responses';
import { AuthStrategy } from './authStrategies';
import { agent } from 'supertest';

declare module 'fastify' {
  interface FastifyRequest {
    user?: any;
  }
  const decoded: {
    user_id: number;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'devflovvdevflovvdevflovv';

export const authMiddleware = (strategy: AuthStrategy) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send(errorResponse('Unauthorized', 401));
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        user_id: number;
        sos_user_id?: number;
        agent_id?: number;
        role: string;
      };

      if (!decoded || !decoded.user_id || !strategy.validate(decoded)) {
        return reply.status(403).send(errorResponse('Access denied.', 403));
      }

      // **Check if the session exists**
      const isSessionValid = await strategy.checkSession(decoded.user_id, token);
      if (!isSessionValid) {
        return reply.status(401).send(errorResponse('Session not found or expired.', 401));
      }

      // Attach user info to request
      request.user = {
        id: decoded.user_id,
        sos_user_id: decoded.sos_user_id,
        agent_id: decoded.role === 'agent' ? decoded.agent_id : null,
        role: decoded.role,
      };
      console.log('request.user :>> ', request.user);
    } catch (error) {
      console.error('Error in authMiddleware:', error);
      return reply.status(401).send(errorResponse('Invalid or expired token.', 401));
    }
  };
};
