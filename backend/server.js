const http = require("http");
const { app, sequelize } = require("./app");
const { setupSocket } = require("./sockets/socket");

const server = http.createServer(app);

setupSocket(server);

async function initiate() {
  try {
    // await sequelize.sync({ force: true })
    await sequelize.sync();
    server.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Error initializing app:", err);
  }
}

initiate();
