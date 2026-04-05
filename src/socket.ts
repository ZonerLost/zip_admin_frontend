import { Server as SocketServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { ENV } from "./config/env";
import { logger } from "./config/logger";
import { JwtPayload } from "./types";
export const initSocket = (httpServer: HttpServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    pingTimeout: 60000,
  });

  // Auth middleware — validate JWT on connection
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Authentication required"));

      const payload = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as JwtPayload;
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;
    logger.info(`Socket connected: ${userId}`);

    // Join personal room to receive direct messages
    socket.join(userId);

    // Join a conversation room
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing indicator
    socket.on("typing", (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user_typing", {
        userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("stop_typing", (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user_stop_typing", {
        userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${userId}`);
    });
  });

  return io;
};

// Helper to emit a new message to conversation room
// Called from ChatRepository after message is created
export let io: SocketServer;

export const setIO = (socketServer: SocketServer) => {
  io = socketServer;
};

export const emitNewMessage = (conversationId: string, message: unknown) => {
  if (io) {
    io.to(`conversation:${conversationId}`).emit("new_message", message);
  }
};

export const emitConversationUpdate = (userId: string, conversation: unknown) => {
  if (io) {
    io.to(userId).emit("conversation_updated", conversation);
  }
};