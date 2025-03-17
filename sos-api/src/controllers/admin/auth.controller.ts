import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../../helper/responses';
import { session } from "../../models/session";
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model';
import AuthUtils from '../../utils/authUtils';
import { refreshToken } from '../user/auth.controller';

export const loginAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as { email: string; password: string };
  
    if (!email || !password) {
      return reply.status(400).send(errorResponse("Email and password are required.", 400));
    }
  
    try {
      const user = await User.findOne({ where: { email, role: "admin" } });
      if (!user) {
        return reply.status(401).send(errorResponse("Unauthorized", 401));
      }
  
      const isPasswordValid = await argon2.verify(user.dataValues.password, password);
      if (!isPasswordValid) {
        return reply.status(401).send(errorResponse("Unauthorized", 401));
      }
      const token = AuthUtils.generateAccessToken({
        user_id: user.dataValues.id,
        role: user.dataValues.role
      })
      const refresh_token = AuthUtils.generateRefreshToken({
        user_id: user.dataValues.id,
        role: user.dataValues.role
      })
  
      session.upsert({ user_id: user.dataValues.id, token, refresh_token: refresh_token });  
  
      const userProfile = {
        id: user.dataValues.id,
        email: user.dataValues.email,
        select_region:user.dataValues.select_region,
        first_name:user.dataValues.first_name,
        last_name:user.dataValues.last_name,
        date_of_birth:user.dataValues.date_of_birth,
        phone_number:user.dataValues.phone_number,
        };
  
      return reply
        .status(200)
        .send(successResponse("Login successful and OTP sent", { token, refresh_token, user: userProfile }, 200));
  
    } catch (err) {
      console.error("Error during login:", err);
      return reply.status(500).send(errorResponse("Internal server error", 500));
    }
  };