import React from 'react';
import { useChat } from '../hooks/useChat';

const Notifications = () => {
  const { notifications, removeNotification } = useChat();

  if (notifications.length === 0) return null;

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification ${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification-content">
            {notification.message}
          </div>
          <button className="notification-close">×</button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
