import { useSocket } from '../context/SocketContext';

export const useChat = () => {
  const {
    socket,
    currentUser,
    users,
    rooms,
    currentRoom,
    messages,
    typingUsers,
    notifications,
    setCurrentRoom,
    setMessages,
    setNotifications
  } = useSocket();

  const sendMessage = (text) => {
    if (socket && text.trim()) {
      socket.emit('send_message', {
        text: text.trim(),
        room: currentRoom
      });
    }
  };

  const startTyping = () => {
    if (socket) {
      socket.emit('typing_start', { room: currentRoom });
    }
  };

  const stopTyping = () => {
    if (socket) {
      socket.emit('typing_stop', { room: currentRoom });
    }
  };

  const joinRoom = (roomName) => {
    if (socket && roomName !== currentRoom) {
      socket.emit('join_room', { roomName });
      setCurrentRoom(roomName);
      setMessages([]);
    }
  };

  const createRoom = (roomName) => {
    if (socket) {
      socket.emit('create_room', { roomName });
    }
  };

  const sendPrivateMessage = (toUserId, text) => {
    if (socket && text.trim()) {
      socket.emit('private_message', {
        toUserId,
        text: text.trim()
      });
    }
  };

  const markAsRead = (messageId) => {
    if (socket) {
      socket.emit('mark_as_read', {
        messageId,
        room: currentRoom
      });
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return {
    currentUser,
    users,
    rooms,
    currentRoom,
    messages,
    typingUsers,
    notifications,
    sendMessage,
    startTyping,
    stopTyping,
    joinRoom,
    createRoom,
    sendPrivateMessage,
    markAsRead,
    removeNotification
  };
};
