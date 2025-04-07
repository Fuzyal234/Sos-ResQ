import { FastifyReply } from 'fastify';
import argon2 from 'argon2';
import { session } from '../../models/session';
import AuthUtils from '../../utils/authUtils';
import { successResponse, errorResponse } from '../../helper/responses';
import { Model } from 'sequelize';

export interface UserProfile {
  id?: string;
  user_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  phone_number?: string;
  is_profile_completed?: boolean;
  contact_added?: boolean;
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
  user: UserProfile;
}

export abstract class BaseAuthService {
  protected abstract getUserModel(): Promise<Model | null>;
  protected abstract getAssociatedModel(): Promise<Model | null>;
  protected abstract getRole(): string;
  protected abstract mapUserProfile(user: Model, associatedModel?: Model): UserProfile;

  async login(email: string, password: string, reply: FastifyReply) {
    if (!email || !password) {
      return reply
        .status(400)
        .send(errorResponse('Email and password are required.', 400));
    }

    try {
      const user = await this.getUserModel();
      if (!user) {
        return reply.status(404).send(errorResponse('User not found', 404));
      }

      const isPasswordValid = await argon2.verify(
        user.dataValues.password ?? '',
        password,
      );
      if (!isPasswordValid) {
        return reply.status(400).send(errorResponse('Invalid password', 400));
      }

      const associatedModel = await this.getAssociatedModel();
      if (associatedModel === null) {
        return reply.status(404).send(errorResponse(`${this.getRole()} not found`, 404));
      }

      const token = AuthUtils.generateAccessToken({
        user_id: user.dataValues.id,
        role: this.getRole(),
      });
      const refresh_token = AuthUtils.generateRefreshToken({
        user_id: user.dataValues.id,
        role: this.getRole(),
      });

      session.upsert({ user_id: user.dataValues.id, token, refresh_token });

      const userProfile = this.mapUserProfile(user, associatedModel);

      return reply
        .status(200)
        .send(
          successResponse(
            'Login successful',
            { token, refresh_token, user: userProfile },
            200,
          ),
        );
    } catch (err) {
      console.error('Error during login:', err);
      return reply.status(500).send(errorResponse('Internal server error', 500));
    }
  }
}