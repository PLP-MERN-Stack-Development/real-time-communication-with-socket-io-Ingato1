const express = require('express');
const http = require('http');
const cors = require('cors');
const { initializeSocket } = require('./socket/socketServer');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Socket.io
initializeSocket(server);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Get server info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Socket.io Chat Server',
    version: '1.0.0',
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
