const { v4: uuidv4 } = require('uuid');

// In-memory storage (replace with database in production)
const users = new Map();
const rooms = new Map();
const messages = new Map();

function handleConnection(io, socket) {
  console.log(`User ${socket.username} connected`);

  // Add user to users list
  const user = {
    id: socket.userId,
    username: socket.username,
    socketId: socket.id,
    status: 'online',
    currentRoom: null,
    lastSeen: new Date()
  };
  users.set(socket.userId, user);

  // Join default room
  socket.join('general');
  user.currentRoom = 'general';
  
  // Notify others about new user
  socket.broadcast.emit('user_joined', {
    user: user,
    timestamp: new Date()
  });

  // Send current users and rooms to the new user
  socket.emit('users_list', Array.from(users.values()));
  socket.emit('rooms_list', Array.from(rooms.keys()));

  // Message events
  socket.on('send_message', (data) => {
    handleSendMessage(io, socket, data);
  });

  socket.on('typing_start', (data) => {
    handleTypingStart(socket, data);
  });

  socket.on('typing_stop', (data) => {
    handleTypingStop(socket, data);
  });

  socket.on('join_room', (data) => {
    handleJoinRoom(io, socket, data);
  });

  socket.on('create_room', (data) => {
    handleCreateRoom(io, socket, data);
  });

  socket.on('private_message', (data) => {
    handlePrivateMessage(io, socket, data);
  });

  socket.on('mark_as_read', (data) => {
    handleMarkAsRead(io, socket, data);
  });

  socket.on('disconnect', () => {
    handleDisconnect(io, socket);
  });
}

function handleSendMessage(io, socket, data) {
  const message = {
    id: uuidv4(),
    text: data.text,
    user: {
      id: socket.userId,
      username: socket.username
    },
    room: data.room || 'general',
    timestamp: new Date(),
    type: 'message',
    readBy: [socket.userId]
  };

  // Store message
  if (!messages.has(message.room)) {
    messages.set(message.room, []);
  }
  messages.get(message.room).push(message);

  // Send to room
  io.to(message.room).emit('new_message', message);
  
  // Send notification to users in room except sender
  socket.to(message.room).emit('message_notification', {
    type: 'new_message',
    room: message.room,
    from: socket.username,
    preview: data.text.substring(0, 50)
  });
}

function handleTypingStart(socket, data) {
  socket.to(data.room).emit('user_typing', {
    user: socket.username,
    userId: socket.userId,
    room: data.room
  });
}

function handleTypingStop(socket, data) {
  socket.to(data.room).emit('user_stopped_typing', {
    user: socket.username,
    userId: socket.userId,
    room: data.room
  });
}

function handleJoinRoom(io, socket, data) {
  const previousRoom = socket.currentRoom;
  
  if (previousRoom) {
    socket.leave(previousRoom);
    socket.to(previousRoom).emit('user_left', {
      user: socket.username,
      room: previousRoom
    });
  }

  socket.join(data.roomName);
  socket.currentRoom = data.roomName;
  
  const user = users.get(socket.userId);
  user.currentRoom = data.roomName;

  // Send room history
  const roomHistory = messages.get(data.roomName) || [];
  socket.emit('room_history', roomHistory);

  socket.to(data.roomName).emit('user_joined_room', {
    user: socket.username,
    room: data.roomName
  });
}

function handleCreateRoom(io, socket, data) {
  if (!rooms.has(data.roomName)) {
    rooms.set(data.roomName, {
      name: data.roomName,
      createdBy: socket.userId,
      createdAt: new Date(),
      isPrivate: data.isPrivate || false
    });

    io.emit('room_created', {
      room: data.roomName,
      createdBy: socket.username
    });
  }
}

function handlePrivateMessage(io, socket, data) {
  const message = {
    id: uuidv4(),
    text: data.text,
    from: {
      id: socket.userId,
      username: socket.username
    },
    to: data.toUserId,
    timestamp: new Date(),
    type: 'private'
  };

  // Find recipient socket
  const recipient = Array.from(users.values()).find(u => u.id === data.toUserId);
  if (recipient) {
    io.to(recipient.socketId).emit('private_message', message);
  }

  // Also send back to sender
  socket.emit('private_message', message);
}

function handleMarkAsRead(io, socket, data) {
  const roomMessages = messages.get(data.room) || [];
  const message = roomMessages.find(m => m.id === data.messageId);
  
  if (message && !message.readBy.includes(socket.userId)) {
    message.readBy.push(socket.userId);
    io.to(data.room).emit('message_read', {
      messageId: data.messageId,
      readBy: socket.userId,
      username: socket.username
    });
  }
}

function handleDisconnect(io, socket) {
  console.log(`User ${socket.username} disconnected`);
  
  const user = users.get(socket.userId);
  if (user) {
    user.status = 'offline';
    user.lastSeen = new Date();
  }

  socket.broadcast.emit('user_left', {
    user: socket.username,
    timestamp: new Date()
  });
}

module.exports = { handleConnection };
