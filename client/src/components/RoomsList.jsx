import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';

const RoomsList = () => {
  const { rooms, currentRoom, joinRoom, createRoom } = useChat();
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (newRoomName.trim() && !rooms.includes(newRoomName.trim())) {
      createRoom(newRoomName.trim());
      setNewRoomName('');
    }
  };

  return (
    <div className="rooms-list">
      <h3>Chat Rooms</h3>
      
      <form onSubmit={handleCreateRoom} className="create-room-form">
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="New room name..."
          className="room-input"
        />
        <button type="submit" className="create-room-button">
          Create
        </button>
      </form>

      <div className="rooms-container">
        {rooms.map(room => (
          <div
            key={room}
            className={`room-item ${room === currentRoom ? 'active-room' : ''}`}
            onClick={() => joinRoom(room)}
          >
            <span className="room-icon">#</span>
            <span className="room-name">{room}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomsList;
