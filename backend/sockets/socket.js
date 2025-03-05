const { Server } = require("socket.io");
const axios = require("axios");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://127.0.0.1:5500",
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("sendMessage", async (data) => {
      const { message, fileUrl, groupId } = data;

      const messageData = {
        message,
        fileUrl,
        groupId,
      };

      try {
        const response = await axios.post(
          "http://localhost:4000/api/user/message",
          messageData,
          {
            headers: {
              Authorization: `${data.token}`,
            },
          }
        );

        io.emit("receiveMessage", {
          message: message || "file message",
          fileUrl: fileUrl || null,
          senderName: response.data.senderName,
          userId: response.data.userId,
          groupId: groupId,
          createdAt: response.data.createdAt,
        });
      } catch (dbError) {
        console.error("Error saving message to the database:", dbError);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocket };
