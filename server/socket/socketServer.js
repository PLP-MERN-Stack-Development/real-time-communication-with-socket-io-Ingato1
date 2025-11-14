const { Server } = require('socket.io');
const socketConfig = require('../config/socketConfig');
const { handleConnection } = require('../controllers/socketController');

function initializeSocket(server) {
  const io = new Server(server, socketConfig);
  
  // Socket middleware for authentication
  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("Invalid username"));
    }
    socket.username = username;
    socket.userId = socket.handshake.auth.userId;
    next();
  });

  io.on('connection', (socket) => {
    handleConnection(io, socket);
  });

  return io;
}

module.exports = { initializeSocket };
