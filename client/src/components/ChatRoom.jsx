import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

const ChatRoom = () => {
  const {
    messages,
    currentUser,
    currentRoom,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when they come into view
    messages.forEach(message => {
      if (message.user.id !== currentUser.userId && !message.readBy?.includes(currentUser.userId)) {
        markAsRead(message.id);
      }
    });
  }, [messages, currentUser.userId, markAsRead]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
      stopTyping();
      setIsTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (e.target.value && !isTyping) {
      startTyping();
      setIsTyping(true);
    } else if (!e.target.value && isTyping) {
      stopTyping();
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h2>#{currentRoom}</h2>
        <div className="room-info">
          <span className="user-count">{messages.length} messages</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.user.id === currentUser.userId ? 'own-message' : ''}`}
          >
            <div className="message-header">
              <span className="username">{message.user.username}</span>
              <span className="timestamp">{formatTime(message.timestamp)}</span>
            </div>
            <div className="message-content">
              {message.text}
            </div>
            {message.readBy && message.readBy.length > 1 && (
              <div className="read-receipts">
                Read by {message.readBy.length} users
              </div>
            )}
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.map(user => user.username).join(', ')} 
            {typingUsers.length === 1 ? ' is' : ' are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={messageInput}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
