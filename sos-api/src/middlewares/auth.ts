import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { errorResponse } from "../helper/responses"; 
import session from "../models/session";

declare module "fastify" {
  interface FastifyRequest {
    user?: any; 
  }
  const decoded: {
    user_id: number;
  }
}

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers["authorization"];
  console.log("authHeader", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send(errorResponse("Unauthorized", 401));
  }

  const token: any = authHeader.replace("Bearer ", "");
  console.log("Token", token);

  try {
  
    const decoded = jwt.decode(token) as { [x: string]: any; id: any } | null;
    console.log("Decoded token", decoded);

    if (!decoded || !decoded.user_id) {
      return reply.status(401).send(errorResponse("Invalid token payload.", 401));
    }
    if (!decoded || !decoded.user_id || decoded.role !== "sos_user") {
      return reply.status(401).send(errorResponse("Invalid token payload.", 401));
    }

    const sessiontoken = new session(decoded.user_id, token);
    console.log("decodeid", decoded.user_id);
    console.log("my token", token);

    if (!sessiontoken) {
      return reply.status(401).send(errorResponse("sessiontoken not found or expired.", 401));
    }

    console.log("jwttoken", process.env.JWT_SECRET);

    jwt.verify(token, process.env.JWT_SECRET || "devflovvdevflovvdevflovv", (err: any) => {
      if (err) {
        return reply.status(401).send(errorResponse("Invalid or expired token.", 401));
      }
    });

  
    request.user = decoded.user_id;
    console.log("sessiontoken.user_id", sessiontoken.user_id);
    console.log("request.user", request.user);

  } catch (error) {
    console.error("Error in authMiddleware:", error);
    return reply.status(500).send(errorResponse("Internal Server Error", 500));
  }
};

export const adminAuthMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send(errorResponse("Unauthorized", 401));
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "devflovvdevflovvdevflovv") as {
      user_id: number;
      role: string;
    };

    if (!decoded || !decoded.user_id || decoded.role !== "admin") {
      return reply.status(403).send(errorResponse("Access denied. Admins only.", 403));
    }

    // Attach user info to request for further processing
    request.user = { id: decoded.user_id, role: decoded.role };

  } catch (error) {
    console.error("Error in adminAuthMiddleware:", error);
    return reply.status(401).send(errorResponse("Invalid or expired token.", 401));
  }
};