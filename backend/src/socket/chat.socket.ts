import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import { getAiResponse } from "../services/ai.service";

export const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("chat:join", async (sessionId: string) => {
      socket.join(sessionId);
      console.log(`👤 Joined session: ${sessionId} for socket: ${socket.id}`);
      
      // Let the socket know it joined if needed
      socket.emit("chat:joined", { sessionId, socketId: socket.id });

      try {
        await prisma.chatSession.upsert({
          where: { sessionId },
          update: {},
          create: { sessionId },
        });

        const history = await prisma.chatMessage.findMany({
          where: { sessionId },
          orderBy: { createdAt: "asc" },
        });
        console.log(`📜 Sending history: ${history.length} messages to ${socket.id}`);
        socket.emit("chat:history", history);
      } catch (error) {
        console.error("❌ Prisma Error in chat:join:", error);
      }
    });

    socket.on(
      "chat:message",
      async (data: { sessionId: string; content: string }) => {
        const { sessionId, content } = data;
        console.log(`📩 New message from ${sessionId}: "${content.substring(0, 50)}..."`);

        try {
          console.time(`message-processing-${sessionId}`);
          // 1. Save user msg to db
          const newUserMsg = await prisma.chatMessage.create({
            data: { sessionId, role: "user", content },
          });
          console.log(`✅ Message saved for ${sessionId}`);

          // 2. Broadcast to room (sync all tabs, confirm to current)
          io.to(sessionId).emit("chat:message", newUserMsg);

          // 3. Get AI Response
          console.log(`🤖 Requesting AI response for ${sessionId}...`);
          const aiResponse = await getAiResponse(sessionId, content);
          console.log(`✅ AI Response received for ${sessionId}`);

          // 4. Save AI msg
          const newAiMsg = await prisma.chatMessage.create({
            data: { sessionId, role: "assistant", content: aiResponse },
          });

          // 5. Send AI msg to client
          io.to(sessionId).emit("chat:message", newAiMsg);
          console.timeEnd(`message-processing-${sessionId}`);
          console.log(`🚀 All steps completed for ${sessionId}`);
        } catch (error) {
          console.error("❌ Chat processing error:", error);
          io.to(sessionId).emit("chat:message", {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "Xin lỗi, Rú đang gặp lỗi hệ thống. Bạn chờ chút rồi nhắn lại nhé! 🌿",
          });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};
