import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model';
import { session } from "../../models/session";
import { successResponse, errorResponse } from '../../helper/responses';
import { generateOTP, sendOTPEmail } from '../../utils/otpUtils';
import { otpStore, sendEmail } from '../../middlewares/email';
import { createUser, createUserAccountService } from '../../services/user/auth.service';
import argon2 from 'argon2';
import { CreateSosUserDTO, CreateUserAccountDTO, CreateUserDTO, UserAccountReturnDTO } from '../../types/user';
import { SosUser } from '../../models';
export interface LoginRequestBody {
  email: string;
  password: string;
}


export const createUserAccount = async (request: FastifyRequest, reply: FastifyReply) => {

  try {
    const userData = request.body as CreateUserAccountDTO;
    const newSosUser = await createUserAccountService(userData);
    const SosUser: UserAccountReturnDTO = {
      email: newSosUser.dataValues.email,
      phone_number: newSosUser.dataValues.phone_number
    };
    return reply
      .status(201)
      .send(successResponse("Your account has been created successfully!", SosUser, 201));
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

    const token = jwt.sign(
      { user_id: sos_user.dataValues.id, role: user.dataValues.role },
      process.env.JWT_SECRET || "devflovvdevflovvdevflovv",
      { expiresIn: "1h" }
    );

    const existingSession = await session.findOne({ where: { user_id: user.dataValues.id } });

    if (existingSession) {
      await session.update(
        { token },
        { where: { user_id: user.dataValues.id } }
      );
    } else {
      await session.create({ user_id: user.dataValues.id, token });
    }

    const otpResponse = await sendOtp(request, reply);

    if (otpResponse.statusCode !== 200) {
      return otpResponse;
    }

    const userProfile = {
      user_id: user.dataValues.id,
      email: user.dataValues.email,
      first_name: user.dataValues.first_name,
      last_name: user.dataValues.last_name,
      date_of_birth: user.dataValues.date_of_birth,
      phone_number: user.dataValues.phone_number,
    };

    return reply
      .status(200)
      .send(successResponse("Login successful and OTP sent", { token, user: userProfile }, 200));

  } catch (err) {
    console.error("Error during login:", err);
    return reply.status(500).send(errorResponse("Internal server error", 500));
  }
};

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


