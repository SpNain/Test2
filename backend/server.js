const http = require("http");
const { app, sequelize } = require("./app"); // Import Express app
const { setupSocket } = require("./sockets/socket"); // Import Socket.IO logic

const server = http.createServer(app); // Create HTTP server

setupSocket(server); // Pass server to Socket.IO

async function initiate() {
  try {
    // await sequelize.sync({ force: true })
    await sequelize.sync(); // Sync Sequelize models with the database
    server.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Error initializing app:", err);
  }
}

initiate();
