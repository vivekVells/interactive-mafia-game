import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, PHASES } from '../contexts/GameContext';
import { getRoleDescription, getRoleIcon, getPhaseDescription } from '../utils/helpers';

const Player = () => {
  const navigate = useNavigate();
  const {
    sessionId,
    isHost,
    gamePhase,
    submitVote,
    currentPlayerId,
    getPlayerInfo
  } = useGame();

  const [playerInfo, setPlayerInfo] = useState(null);
  const [votedFor, setVotedFor] = useState(localStorage.getItem('mafia_player_vote') || null);

  // Redirect if user is host
  useEffect(() => {
    if (isHost || !sessionId || !currentPlayerId) {
      navigate('/');
      return;
    }
    
    // Get player info from localStorage
    const playerData = getPlayerInfo();
    if (playerData) {
      setPlayerInfo(playerData);
    }
  }, [isHost, sessionId, currentPlayerId, getPlayerInfo, navigate]);

  // We don't need handleVote anymore since votes are entered manually

  // If waiting for approval
  if (!playerInfo) {
    return (
      <div className="container">
        <div className="card">
          <h1>Waiting for Host</h1>
          <p>Please wait while the host approves your request to join.</p>
          <p>Session ID: {sessionId}</p>
        </div>
      </div>
    );
  }

  // We don't know if a player is eliminated in this implementation
  // The player would need to be told by the host
  if (playerInfo && playerInfo.isEliminated) {
    return (
      <div className="container">
        <div className="card">
          <h1>You've been eliminated</h1>
          <p>You are now a spectator. Please keep your role a secret.</p>
          
          <div className="role-card">
            <h2>Your Role</h2>
            <div className="role-icon">{getRoleIcon(playerInfo.role)}</div>
            <h3>{playerInfo.role}</h3>
            <p>{getRoleDescription(playerInfo.role)}</p>
          </div>
          
          <div className="phase-indicator">
            {getPhaseDescription(gamePhase)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Game Session: {sessionId}</h1>
        
        <div className="role-card">
          <h2>Your Role</h2>
          <div className="role-icon">{getRoleIcon(playerInfo.role)}</div>
          <h3>{playerInfo.role}</h3>
          <p>{getRoleDescription(playerInfo.role)}</p>
        </div>
        
        <div className="phase-indicator">
          {getPhaseDescription(gamePhase)}
        </div>
        
        {/* Day Phase - Voting */}
        {gamePhase === PHASES.DAY && (
          <div className="vote-controls">
            <h2>Your Vote</h2>
            <p>
              Tell the host who you are voting for. Then make note of it here:
            </p>
            <input
              type="text"
              placeholder="Name of player you voted for"
              value={votedFor || ''}
              onChange={(e) => {
                const vote = e.target.value;
                setVotedFor(vote);
                localStorage.setItem('mafia_player_vote', vote);
              }}
            />
          </div>
        )}
        
        {/* Night Phase - Special Actions */}
        {gamePhase.startsWith('night_') && (
          <div>
            <h2>Night Phase</h2>
            <p>Follow the host's instructions. Use your special ability when instructed.</p>
          </div>
        )}
        
        {/* Results Phase */}
        {gamePhase === PHASES.RESULTS && (
          <div>
            <h2>Results</h2>
            <p>The host will announce the results of the night phase.</p>
          </div>
        )}
        
        {/* Game Over */}
        {gamePhase === PHASES.GAME_OVER && (
          <div>
            <h2>Game Over</h2>
            <p>The host will announce the winners.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;
