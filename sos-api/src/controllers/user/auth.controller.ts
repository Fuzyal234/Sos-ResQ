import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { SosUser, User } from '../../models/index';
import { session } from "../../models/session";
import { successResponse, errorResponse } from '../../helper/responses';
import { generateOTP, sendOTPEmail } from '../../utils/otpUtils';
import { otpStore, sendEmail } from '../../middlewares/email';
import { createUser, createUserAccountService } from '../../services/user/auth.service';
import argon2 from 'argon2';
import { CreateSosUserDTO, CreateUserAccountDTO, CreateUserDTO, UserAccountReturnDTO } from '../../types/user';
import utilityService from '../../services/utility.service';
import { UUID } from 'crypto';
import sessionService from '../../services/session.service';
import userAuthService from '../../services/user/auth.service';
const { OAuth2Client } = require('google-auth-library');

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export interface LoginRequestBody {
  email: string;
  password: string;
}


export const createUserAccount = async (request: FastifyRequest, reply: FastifyReply) => {

  try {
    const userData = request.body as CreateUserAccountDTO;
    userData.email = userData.email.toLowerCase();

    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      return reply.status(400).send(errorResponse("User with this email already exists.", 400));
    }
    const newSosUser = await createUserAccountService(userData);
    console.log('newSosUser :>> ', newSosUser);
    if (newSosUser) {
      const token = await generateAccessToken({ user_id: newSosUser.id, role: "sos_user" });
      const refresh_token = await generateRefreshToken({ user_id: newSosUser.id, role: "sos_user" })

      const existingSession = await session.findOne({ where: { user_id: newSosUser.user_id } });
      if (existingSession) {
        await session.update(
          { token, refresh_token},
          { where: { user_id: newSosUser.id } }
        );
      } else {
        const user = await SosUser.findByPk(newSosUser.id);
        const newSession = await session.create({ user_id: newSosUser.user_id, token, refresh_token });
        console.log('newSession :>> ', newSession);
      }
      const userProfile = {
        user_id: newSosUser.id,
        email: newSosUser.email,
        first_name: newSosUser.first_name,
        last_name: newSosUser.last_name,
        date_of_birth: newSosUser.date_of_birth,
        phone_number: newSosUser.phone_number,
        is_profile_completed: newSosUser.is_profile_completed,
        contact_added: newSosUser.contact_added
      };
      return reply
        .status(201)
        .send(successResponse("Your account has been created successfully!", { token, refresh_token, user: userProfile }, 201));
    }
  } catch (error) {
    console.error("Error during signup:", error);
    return reply
      .status(500)
      .send(errorResponse("Something went wrong.", 500));
  }
};


export const loginUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = request.body as { email: string; password: string };

  if (!email || !password) {
    return reply.status(400).send(errorResponse("Email and password are required.", 400));
  }

  try {
    const user = await User.findOne({ where: { email, role: "sos_user" } });
    if (!user) {
      return reply.status(404).send(errorResponse("User not found", 404));
    }

    const isPasswordValid = await argon2.verify(user.dataValues.password, password);
    if (!isPasswordValid) {
      return reply.status(400).send(errorResponse("Invalid password", 400));
    }

    const sos_user = await SosUser.findOne({ where: { user_id: user.dataValues.id } });
    if (!sos_user) {
      return reply.status(404).send(errorResponse("SOS User not found", 404));
    }
    const payload = {
      user_id: sos_user.dataValues.id,
      role: user.dataValues.role
    }
    const token = await generateAccessToken(payload);
    const refresh_token = await generateRefreshToken(payload);
    const existingSession = await session.findOne({ where: { user_id: user.dataValues.id } });

    if (existingSession) {
      await session.update(
        { token, refresh_token },
        { where: { user_id: user.dataValues.id } }
      );
    } else {
      await session.create({ user_id: user.dataValues.id, token, refresh_token });
    }
    // Stoped for now

    // const otpResponse = await sendOtp(request, reply);

    // if (otpResponse.statusCode !== 200) {
    //   return otpResponse;
    // }
    console.log('sos_user :>> ', sos_user);
    const userProfile = {
      user_id: user.dataValues.id,
      email: user.dataValues.email,
      first_name: user.dataValues.first_name,
      last_name: user.dataValues.last_name,
      date_of_birth: user.dataValues.date_of_birth,
      phone_number: user.dataValues.phone_number,
      is_profile_completed: sos_user.dataValues.is_profile_completed,
      contact_added: sos_user.dataValues.contact_added
    };
    console.log('userProfile :>> ', userProfile);
    return reply
      .status(200)
      .send(successResponse("Login successful", { token,refresh_token, user: userProfile }, 200));

  } catch (err) {
    console.error("Error during login:", err);
    return reply.status(500).send(errorResponse("Internal server error", 500));
  }
};

export const refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {

  try {
    const { refresh_token } = request.body as { refresh_token: string };

    if (!refresh_token) {
      return reply.status(400).send(errorResponse("Refresh token is required.", 400));
    }

    const payload = await verifyRefreshToken(refresh_token);

    if (!payload) {
      return reply.status(401).send(errorResponse("Invalid refresh token.", 401));
    }

    const token = await generateAccessToken({
      user_id: payload.user_id,
      role: payload.role
    });
    const referesh_token = await generateRefreshToken({
      user_id: payload.user_id,
      role: payload.role
    })
    const sos_user = await SosUser.findOne({ where: { id: payload.user_id } });

    if (!sos_user) {
      return reply.status(404).send(errorResponse("SOS User not found", 404));
    }
    const existingSession = await session.findOne({ where: { user_id: sos_user.dataValues.user_id } });

    if (existingSession) {
      await session.update(
        { token, refresh_token },
        { where: { user_id: sos_user.dataValues.user_id } }
      );
    } else {
      await session.create({ user_id: sos_user.dataValues.user_id, token, refresh_token });
    }
    return reply
      .status(200)
      .send(successResponse("Token refreshed successfully.", { token, refresh_token }, 200));
  } catch (err) {
    console.error("Error during refresh token:", err);
    return reply.status(500).send(errorResponse("Internal server error", 500));
  }
}

export const sendOtp = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email } = request.body as { email: string };

  if (!email) {
    return reply.status(400).send(errorResponse("Email is required for OTP.", 400));
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return reply.status(404).send(errorResponse("User not found", 404));
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore[email] = { otp, expiresAt };
    console.log("OTP Store:", otpStore);

    await sendEmail(email, "Your Login OTP", `<p>Your OTP is: <b>${otp}</b></p>`);
    return { statusCode: 200, body: successResponse("OTP sent successfully. Please verify.", null, 200) };
  } catch (err) {
    console.error("Error during OTP sending:", err);
    return { statusCode: 500, body: errorResponse("Internal server error", 500) };
  }
};

export const forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {

  try {
    const { email } = request.body as { email: string; };

    if (!email) {
      return reply.status(400).send(errorResponse("Email is required.", 400));
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return reply.status(404).send(errorResponse("User not found", 404));
    }

    const otp = await generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore[email] = { otp, expiresAt };

    await sendOTPEmail(email, otp);

    return reply
      .status(200)
      .send(successResponse("OTP sent successfully. Please verify.", null, 200));
  } catch (err) {
    console.error("Error during password reset:", err);
    return reply.status(500).send(errorResponse("Internal server error", 500));
  }
}

const verifiedUsers = new Map<string, boolean>();

export const verifyOtp = async (request: FastifyRequest, reply: FastifyReply) => {

  const { email, otp } = request.body as { email: string; otp: string };

  if (!email || !otp) {
    return reply.status(400).send(errorResponse("Email and OTP are required", 400));
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return reply.status(404).send(errorResponse("User not found", 404));
    }

    const storedOtpData = otpStore[email];
    if (!storedOtpData) {
      return reply.status(400).send(errorResponse("OTP not generated or expired", 400));
    }

    const { otp: storedOtp, expiresAt } = storedOtpData;
    if (Date.now() > expiresAt) {
      delete otpStore[email];
      return reply.status(400).send(errorResponse("OTP has expired", 400));
    }

    if (otp !== storedOtp) {
      return reply.status(400).send(errorResponse("Invalid OTP", 400));
    }

    delete otpStore[email];
    verifiedUsers.set(email, true);

    return reply
      .status(200)
      .send(successResponse("OTP verified successfully. Login successful.", {}, 200));
  } catch (err) {
    console.error("Error during OTP verification:", err);
    return reply.status(500).send(errorResponse("Internal server error", 500));
  }
};

export const resetPassword = async (request: FastifyRequest, reply: FastifyReply) => {

  try {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.status(400).send(errorResponse("Email and password are required.", 400));
    }
    if (!verifiedUsers.get(email)) {
      return reply.status(403).send(errorResponse("Email is not verified. Verify OTP first.", 403));
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return reply.status(404).send(errorResponse("User not found", 404));
    }

    const hashedPassword = await argon2.hash(password);

    await User.update({ password: hashedPassword }, { where: { email } });

    return reply
      .status(200)
      .send(successResponse("Password reset successful.", null, 200));
  } catch (err) {
    console.error("Error during password reset:", err);
    return reply.status(500).send(errorResponse("Internal server error", 500));
  }
}

export async function googleAuthCallback(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { google_auth_token } = request.body as { google_auth_token: string };
    if (!google_auth_token) {
      return reply.status(400).send(errorResponse("Invalid code", 400));
    }

    const payload = await utilityService.verifyGoogleToken(google_auth_token);
    if (!payload) {
      return reply.status(400).send(errorResponse("Invalid email", 400));
    }

    const { email, sub: google_user_id } = payload;
    let user = await User.findOne({ where: { email } });

    if (user) {
      user = await userAuthService.getSosUserDTO(user);
    }

    if (!user) {
      user = await userAuthService.createUserFromGoogle(payload, google_user_id);
    }
    console.log('user ___:>> ', user);
    return await userAuthService.handleUserLogin(user, reply);
  } catch (err) {
    console.error("Error during Google authentication:", err);
    return reply.status(500).send(errorResponse("Internal server error", 500));
  }
}
export async function logoutUser(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Received token:", token);

    await session.destroy({ where: { token } });

    console.log("Session deleted successfully for token:", token);
    return { success: true };
  } catch (error) {
    console.error("Error during logout:", error);
    return { success: false, error: "Invalid or expired token." };
  }
}


export async function generateAccessToken(payload){
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || "devflovvdevflovvdevflovv",
    { expiresIn: "24h" }
  );
  return token
}

export async function generateRefreshToken(payload){
  const refresh_token = jwt.sign(
    payload,
    process.env.JWT_SECRET || "devflovvdevflovvdevflovv",
    { expiresIn: "7d" }
  );
  return refresh_token
}

export async function verifyRefreshToken(refresh_token: string){
  try {
    const payload = jwt.verify(refresh_token, process.env.JWT_SECRET || "devflovvdevflovvdevflovv");
    console.log('payload :>> ', payload);
    return payload;
  } catch (error) {
    return null;
  }
}