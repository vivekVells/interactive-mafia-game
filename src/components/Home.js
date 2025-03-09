import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';

const Home = () => {
  const navigate = useNavigate();
  const { createSession, joinSession } = useGame();
  const [sessionId, setSessionId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleCreateSession = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    createSession();
    navigate('/host');
  };

  const handleJoinSession = () => {
    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }
    
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    joinSession(sessionId.toUpperCase(), playerName);
    navigate('/player');
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Mafia Game</h1>
        <p>Join an existing game or create a new one to host.</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div>
          <h2>Join Game</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Session ID"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button onClick={handleJoinSession}>Join Game</button>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <h2>Host Game</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={handleCreateSession}>Create New Game</button>
        </div>
      </div>
    </div>
  );
};

export default Home;

