import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import User from '../../models/user';
import { session } from "../../models/session";
import { successResponse, errorResponse } from '../../helper/responses';
import { generateOTP } from '../../utils/otpUtils';
import { otpStore, sendEmail } from '../../middlewares/email';
import { createUser } from '../../services/auth.service';
import argon2 from 'argon2';
import { CreateUserDTO } from '../../types/user';
export interface LoginRequestBody {
  email: string;
  password: string;
}


export const addUser = async (request: FastifyRequest, reply: FastifyReply) => {

  try {
    const userData = request.body as CreateUserDTO;
    const newUser = await createUser(userData);
    return reply
      .status(201)
      .send(successResponse("User registered successfully!", newUser, 201));
  } catch (error) {
    console.error("Error registering user:", error);
    return reply
      .status(500)
      .send(errorResponse("Internal server error.", 500));
  }
};


export const loginUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = request.body as { email: string; password: string };

  if (!email || !password) {
    return reply.status(400).send(errorResponse("Email and password are required.", 400));
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return reply.status(404).send(errorResponse("User not found", 404));
    }

    const isPasswordValid = await argon2.verify(user.dataValues.password, password);
    if (!isPasswordValid) {
      return reply.status(400).send(errorResponse("Invalid password", 400));
    }

    const token = jwt.sign(
      { user_id: user.dataValues.id },
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
      first_name:user.dataValues.first_name,
      last_name:user.dataValues.last_name,
      date_of_birth:user.dataValues.date_of_birth,
      phone_number:user.dataValues.phone_number,
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
    return reply
      .status(200)
      .send(successResponse("OTP verified successfully. Login successful.", { }, 200));
  } catch (err) {
    console.error("Error during OTP verification:", err);
    return reply.status(500).send(errorResponse("Internal server error", 500));
  }
};




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


