import { Model } from 'sequelize';
import { FastifyReply } from 'fastify';
import { BaseAuthService, UserProfile } from './base-auth.service';
import User from '../../models/user.model';
import { SosUser } from '../../models';
import AuthUtils from '../../utils/authUtils';
import { session } from '../../models/session';
import { successResponse, errorResponse } from '../../helper/responses';
import argon2 from 'argon2';

export class SosAuthService extends BaseAuthService {
  private email: string;
  private user: Model | null = null;
  private sosUser: Model | null = null;

  constructor(email: string) {
    super();
    this.email = email;
  }

  protected async getUserModel(): Promise<Model | null> {
    if (!this.user) {
      this.user = await User.findOne({ where: { email: this.email, role: 'sos_user' } });
    }
    return this.user;
  }

  protected async getAssociatedModel(): Promise<Model | null> {
    if (!this.sosUser) {
      const user = await this.getUserModel();
      if (!user) return null;
      this.sosUser = await SosUser.findOne({ where: { user_id: user.dataValues.id } });
    }
    return this.sosUser;
  }

  protected getRole(): string {
    return 'sos_user';
  }

  protected mapUserProfile(user: Model, associatedModel?: Model): UserProfile {
    return {
      user_id: user.dataValues.id,
      email: user.dataValues.email,
      first_name: user.dataValues.first_name,
      last_name: user.dataValues.last_name,
      date_of_birth: user.dataValues.date_of_birth,
      phone_number: user.dataValues.phone_number,
      is_profile_completed: associatedModel?.dataValues.is_profile_completed,
      contact_added: associatedModel?.dataValues.contact_added,
    };
  }

  // Override the login method to include sos_user_id in the token
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

      const sosUser = await this.getAssociatedModel();
      if (sosUser === null) {
        return reply.status(404).send(errorResponse('SOS User not found', 404));
      }

      const token = AuthUtils.generateAccessToken({
        user_id: user.dataValues.id,
        sos_user_id: sosUser.dataValues.id,
        role: this.getRole(),
      });
      const refresh_token = AuthUtils.generateRefreshToken({
        user_id: user.dataValues.id,
        sos_user_id: sosUser.dataValues.id,
        role: this.getRole(),
      });

      session.upsert({ user_id: user.dataValues.id, token, refresh_token });

      const userProfile = this.mapUserProfile(user, sosUser);

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