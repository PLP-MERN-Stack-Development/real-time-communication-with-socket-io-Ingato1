import React from 'react';
import { useChat } from '../hooks/useChat';

const UsersList = () => {
  const { users, currentUser } = useChat();

  return (
    <div className="users-list">
      <h3>Online Users ({users.length})</h3>
      <div className="users-container">
        {users.map(user => (
          <div
            key={user.id}
            className={`user-item ${user.id === currentUser.userId ? 'current-user' : ''}`}
          >
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="username">
                {user.username}
                {user.id === currentUser.userId && ' (You)'}
              </span>
              <div className="user-status">
                <span className={`status-indicator ${user.status}`}></span>
                {user.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;
