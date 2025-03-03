const { Server } = require("socket.io");
const axios = require("axios");

function setupSocket(server) { // getting server from server.js file
  const io = new Server(server, {
    cors: {
      origin: "http://127.0.0.1:5500",
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // console.log(`User connected: ${socket.id} - ${socket.user.name}`);

    // Listen for "sendMessage" event from the client
    socket.on("sendMessage", async (data) => {
      const messageData = {
        message: data.message,
        groupId: data.groupId,
      };

      try {
        // Send message to backend API to store in database
        const response = await axios.post(
          "http://localhost:4000/api/user/message",
          messageData,
          {
            headers: {
              Authorization: `${data.token}`, // Pass auth token
            },
          }
        );

        // Broadcast message to all connected clients
        io.emit("receiveMessage", {
          message: data.message,
          senderName: response.data.senderName,
          userId: response.data.userId,
          groupId: data.groupId,
          createdAt: response.data.createdAt,
        });
      } catch (dbError) {
        console.error("Error saving message to the database:", dbError);
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocket };
