import React from 'react';
import { SocketProvider } from './context/SocketContext';
import ChatRoom from './components/ChatRoom';
import UsersList from './components/UsersList';
import RoomsList from './components/RoomsList';
import Notifications from './components/Notifications';
import { useChat } from './hooks/useChat';
import './App.css';

const AppContent = () => {
  const { isConnected, currentUser } = useChat();

  return (
    <div className="app">
      <Notifications />
      
      <div className="app-header">
        <h1>Socket.io Chat</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
          {currentUser && ` • ${currentUser.username}`}
        </div>
      </div>

      <div className="app-layout">
        <aside className="sidebar">
          <RoomsList />
          <UsersList />
        </aside>
        
        <main className="main-content">
          <ChatRoom />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}

export default App;
