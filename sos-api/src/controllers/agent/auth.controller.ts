import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../../helper/responses';
import { session } from '../../models/session';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model';
import { Agent } from '../../models';
import AuthUtils from '../../utils/authUtils';
import { ref } from 'joi';
import { AgentAuthService } from '../../services/auth/agent-auth.service';

export const loginAgent = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { email, password } = request.body as {
    email: string;
    password: string;
  };

  const authService = new AgentAuthService(email);
  return await authService.login(email, password, reply);
};
