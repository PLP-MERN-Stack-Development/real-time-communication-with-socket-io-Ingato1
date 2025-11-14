import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../socket/socketClient';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState(['general']);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initialize user on component mount
    const userData = {
      username: `User${Math.floor(Math.random() * 1000)}`,
      userId: `user-${Date.now()}`
    };
    setCurrentUser(userData);

    const socketInstance = socketService.connect(userData);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('users_list', (usersList) => {
      setUsers(usersList);
    });

    socketInstance.on('rooms_list', (roomsList) => {
      setRooms(prev => [...new Set([...prev, ...roomsList])]);
    });

    socketInstance.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('room_history', (history) => {
      setMessages(history);
    });

    socketInstance.on('user_typing', (data) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.userId !== data.userId);
        return [...filtered, data];
      });
    });

    socketInstance.on('user_stopped_typing', (data) => {
      setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
    });

    socketInstance.on('user_joined', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: `${data.user.username} joined the chat`,
        timestamp: new Date()
      }]);
    });

    socketInstance.on('user_left', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: `${data.user} left the chat`,
        timestamp: new Date()
      }]);
    });

    socketInstance.on('message_notification', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'message',
        message: `New message from ${data.from} in ${data.room}: ${data.preview}...`,
        timestamp: new Date()
      }]);
    });

    socketInstance.on('room_created', (data) => {
      setRooms(prev => [...prev, data.room]);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: `New room "${data.room}" created by ${data.createdBy}`,
        timestamp: new Date()
      }]);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const value = {
    socket,
    isConnected,
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
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
