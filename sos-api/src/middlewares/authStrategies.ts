import session from '../models/session';
import { authMiddleware } from './auth.middleware';

interface AuthStrategy {
  validate(decoded: any): boolean;
  checkSession(userId: number, token: string): Promise<boolean>;
}

class SosUserAuthStrategy implements AuthStrategy {
  validate(decoded: any): boolean {
    return decoded.role === 'sos_user';
  }

  async checkSession(userId: number, token: string): Promise<boolean> {
    const sessionToken = await session.findOne({
      where: { user_id: userId, token },
    });
    return !!sessionToken;
  }
}

class AgentAuthStrategy implements AuthStrategy {
  validate(decoded: any): boolean {
    return decoded.role === 'agent';
  }

  async checkSession(userId: number, token: string): Promise<boolean> {
    const sessionToken = await session.findOne({
      where: { user_id: userId, token },
    });
    return !!sessionToken;
  }
}

class AdminAuthStrategy implements AuthStrategy {
  validate(decoded: any): boolean {
    return decoded.role === 'admin';
  }

  async checkSession(userId: number, token: string): Promise<boolean> {
    const sessionToken = await session.findOne({
      where: { user_id: userId, token },
    });
    return !!sessionToken;
  }
}
const sosUserAuthMiddleware = authMiddleware(new SosUserAuthStrategy());
const agentAuthMiddleware = authMiddleware(new AgentAuthStrategy());
const adminAuthMiddleware = authMiddleware(new AdminAuthStrategy());

export {
  AuthStrategy,
  sosUserAuthMiddleware,
  agentAuthMiddleware,
  adminAuthMiddleware,
};
