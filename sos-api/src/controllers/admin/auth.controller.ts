import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../../helper/responses';
import { session } from '../../models/session';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model';
import AuthUtils from '../../utils/authUtils';
import { refreshToken } from '../user/auth.controller';
import { AdminAuthService } from '../../services/auth/admin-auth.service';

export const loginAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { email, password } = request.body as {
    email: string;
    password: string;
  };

  const authService = new AdminAuthService(email);
  return await authService.login(email, password, reply);
};
