import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../../helper/responses';
import { session } from '../../models/session';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model';
import AuthUtils from '../../utils/authUtils';
import { refreshToken } from '../user/auth.controller';
import { AdminAuthService } from '../../services/auth/admin-auth.service';

class AdminAuthController {
  public async loginAdmin(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    const authService = new AdminAuthService(email);
    return await authService.login(email, password, reply);
  }

  public async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const { old_password, new_password } = request.body as {
      old_password: string;
      new_password: string;
    };
    try {
      const user = await User.findByPk(request.user.id);
      if (!user) {
        return reply.status(404).send(errorResponse('User not found', 404));
      }
      const email = user.dataValues.email;
      const authService = new AdminAuthService(email);
      const passwordChanged = await authService.changePassword(email, old_password, new_password);
      if (passwordChanged) {
        return reply.status(200).send(successResponse('Password changed successfully.', null, 200));
      }
    } catch (e) {
      console.log(e);
      return reply.status(500).send(errorResponse('Something went wrong', 500));
    }
  }
}

export default new AdminAuthController();
