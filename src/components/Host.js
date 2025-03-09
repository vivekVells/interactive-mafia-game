import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, ROLES, PHASES } from '../contexts/GameContext';
import { findMostVotedPlayer, getPhaseDescription } from '../utils/helpers';

const Host = () => {
  const navigate = useNavigate();
  const {
    sessionId,
    isHost,
    players,
    gamePhase,
    roleCount,
    setRoleCount,
    assignRoles,
    startGame,
    collectVotes,
    eliminatePlayer,
    nextPhase,
    checkGameOver,
    resetGame,
    approvePlayer,
    recordVote,
  } = useGame();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedMafiaAction, setSelectedMafiaAction] = useState(null);
  const [selectedDoctorAction, setSelectedDoctorAction] = useState(null);
  const [selectedPoliceAction, setSelectedPoliceAction] = useState(null);
  const [policeResult, setPoliceResult] = useState(null);
  const [eliminationResult, setEliminationResult] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  // Redirect if not host
  useEffect(() => {
    if (!isHost || !sessionId) {
      navigate('/');
    }
  }, [isHost, sessionId, navigate]);

  // Handle adding a new player
  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      approvePlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  // Handle role count changes
  const handleRoleCountChange = (role, value) => {
    const newValue = parseInt(value, 10) || 0;
    setRoleCount(prev => ({
      ...prev,
      [role]: Math.max(0, newValue)
    }));
  };

  // Handle night actions
  const handleNightAction = (playerId) => {
    if (gamePhase === PHASES.NIGHT_MAFIA) {
      setSelectedMafiaAction(playerId);
    } else if (gamePhase === PHASES.NIGHT_DOCTOR) {
      setSelectedDoctorAction(playerId);
    } else if (gamePhase === PHASES.NIGHT_POLICE) {
      setSelectedPoliceAction(playerId);
      
      // Show if the selected player is Mafia
      const selectedPlayer = players.find(p => p.id === playerId);
      setPoliceResult(selectedPlayer?.role === ROLES.MAFIA);
    }
  };

  // We'll use recordVote directly from the context when needed

  // Process day phase voting
  const handleProcessVotes = () => {
    const votes = collectVotes() || {};
    const mostVotedId = findMostVotedPlayer(votes);
    
    if (mostVotedId) {
      eliminatePlayer(mostVotedId);
      const votedPlayer = players.find(p => p.id === mostVotedId);
      setEliminationResult({
        name: votedPlayer?.name,
        role: votedPlayer?.role,
        method: 'voted out'
      });
    } else {
      setEliminationResult({ name: 'No one', method: 'tied vote' });
    }
    
    nextPhase(); // Move to night phase
  };

  // Process night phase results
  const handleProcessNightResults = () => {
    if (selectedMafiaAction && selectedMafiaAction !== selectedDoctorAction) {
      eliminatePlayer(selectedMafiaAction);
      const killedPlayer = players.find(p => p.id === selectedMafiaAction);
      setEliminationResult({
        name: killedPlayer?.name,
        role: killedPlayer?.role,
        method: 'killed by Mafia'
      });
    } else {
      setEliminationResult({ name: 'No one', method: 'Doctor saved the target' });
    }
    
    // Reset actions
    setSelectedMafiaAction(null);
    setSelectedDoctorAction(null);
    setSelectedPoliceAction(null);
    setPoliceResult(null);
    
    // Check if game is over
    const result = checkGameOver();
    if (result) {
      setGameResult(result);
    }
    
    nextPhase(); // Back to day phase
  };

  // Total role count
  const totalRoleCount = Object.values(roleCount).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="container">
      <div className="card">
        <h1>Host Game</h1>
        <p>Session ID: <strong>{sessionId}</strong></p>
        <p>Share this ID with players to join your game.</p>
        
        <div className="phase-indicator">
          {getPhaseDescription(gamePhase)}
        </div>
        
        {/* Setup Phase UI */}
        {gamePhase === PHASES.SETUP && (
          <div>
            <h2>Game Setup</h2>
            
            {/* Add New Player */}
            <div>
              <h3>Add Player</h3>
              <div style={{ display: 'flex', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Player name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <button onClick={handleAddPlayer}>Add Player</button>
              </div>
            </div>
            
            {/* Current Players */}
            <h3>Players ({players.length})</h3>
            <div className="player-grid">
              {players.map(player => (
                <div key={player.id} className="player-card">
                  <div>{player.name}</div>
                </div>
              ))}
            </div>
            
            {/* Role Configuration */}
            <h3>Role Configuration</h3>
            <div>
              <div>
                <label>
                  Mafia:
                  <input
                    type="number"
                    min="0"
                    value={roleCount[ROLES.MAFIA]}
                    onChange={(e) => handleRoleCountChange(ROLES.MAFIA, e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  Doctor:
                  <input
                    type="number"
                    min="0"
                    max="1"
                    value={roleCount[ROLES.DOCTOR]}
                    onChange={(e) => handleRoleCountChange(ROLES.DOCTOR, e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  Police:
                  <input
                    type="number"
                    min="0"
                    max="1"
                    value={roleCount[ROLES.POLICE]}
                    onChange={(e) => handleRoleCountChange(ROLES.POLICE, e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  Villagers:
                  <input
                    type="number"
                    min="0"
                    value={roleCount[ROLES.VILLAGER]}
                    onChange={(e) => handleRoleCountChange(ROLES.VILLAGER, e.target.value)}
                  />
                </label>
              </div>
              <p>Total roles: {totalRoleCount}</p>
              <p>Total players: {players.length}</p>
              {totalRoleCount !== players.length && (
                <p className="error-message">
                  The number of roles must match the number of players
                </p>
              )}
            </div>
            
            <div className="host-controls">
              <button
                onClick={assignRoles}
                disabled={totalRoleCount !== players.length || players.length < 3}
              >
                Assign Roles
              </button>
              <button
                onClick={startGame}
                disabled={players.some(p => !p.role) || players.length < 3}
              >
                Start Game
              </button>
            </div>
          </div>
        )}
        
        {/* Day Phase UI */}
        {gamePhase === PHASES.DAY && (
          <div>
            <h2>Day Phase</h2>
            <p>Players are discussing and voting.</p>
            
            <div className="player-grid">
              {players.map(player => (
                <div 
                  key={player.id} 
                  className={`player-card ${!player.isAlive ? 'eliminated' : ''}`}
                >
                  <div>{player.name}</div>
                  <div>{player.isAlive ? 'Alive' : 'Eliminated'}</div>
                  <div>{player.role}</div>
                </div>
              ))}
            </div>
            
            <div className="host-controls">
              <button onClick={handleProcessVotes}>
                Process Votes & Move to Night
              </button>
            </div>
          </div>
        )}
        
        {/* Night Phase UI - Mafia */}
        {gamePhase === PHASES.NIGHT_MAFIA && (
          <div>
            <h2>Night Phase - Mafia</h2>
            <p>The Mafia should open their eyes and select a victim.</p>
            
            <div className="player-grid">
              {players.filter(p => p.isAlive).map(player => (
                <div 
                  key={player.id} 
                  className={`player-card ${selectedMafiaAction === player.id ? 'selected' : ''}`}
                  onClick={() => handleNightAction(player.id)}
                >
                  <div>{player.name}</div>
                </div>
              ))}
            </div>
            
            <div className="host-controls">
              <button 
                onClick={() => nextPhase()}
                disabled={!selectedMafiaAction}
              >
                Next: Doctor
              </button>
            </div>
          </div>
        )}
        
        {/* Night Phase UI - Doctor */}
        {gamePhase === PHASES.NIGHT_DOCTOR && (
          <div>
            <h2>Night Phase - Doctor</h2>
            <p>The Doctor should open their eyes and select someone to save.</p>
            
            <div className="player-grid">
              {players.filter(p => p.isAlive).map(player => (
                <div 
                  key={player.id} 
                  className={`player-card ${selectedDoctorAction === player.id ? 'selected' : ''}`}
                  onClick={() => handleNightAction(player.id)}
                >
                  <div>{player.name}</div>
                </div>
              ))}
            </div>
            
            <div className="host-controls">
              <button 
                onClick={() => nextPhase()}
                disabled={!selectedDoctorAction}
              >
                Next: Police
              </button>
            </div>
          </div>
        )}
        
        {/* Night Phase UI - Police */}
        {gamePhase === PHASES.NIGHT_POLICE && (
          <div>
            <h2>Night Phase - Police</h2>
            <p>The Police should open their eyes and select someone to investigate.</p>
            
            <div className="player-grid">
              {players.filter(p => p.isAlive).map(player => (
                <div 
                  key={player.id} 
                  className={`player-card ${selectedPoliceAction === player.id ? 'selected' : ''}`}
                  onClick={() => handleNightAction(player.id)}
                >
                  <div>{player.name}</div>
                </div>
              ))}
            </div>
            
            {policeResult !== null && (
              <div className="result-card">
                <p>Investigation result: The player is {policeResult ? 'Mafia' : 'not Mafia'}</p>
              </div>
            )}
            
            <div className="host-controls">
              <button 
                onClick={() => nextPhase()}
                disabled={!selectedPoliceAction}
              >
                Process Night Actions
              </button>
            </div>
          </div>
        )}
        
        {/* Results Phase UI */}
        {gamePhase === PHASES.RESULTS && (
          <div>
            <h2>Results</h2>
            
            {eliminationResult && (
              <div className="result-card">
                <h3>Elimination Result</h3>
                <p>{eliminationResult.name} was {eliminationResult.method}.</p>
                {eliminationResult.role && (
                  <p>They were a {eliminationResult.role}.</p>
                )}
              </div>
            )}
            
            <div className="player-grid">
              {players.map(player => (
                <div 
                  key={player.id} 
                  className={`player-card ${!player.isAlive ? 'eliminated' : ''}`}
                >
                  <div>{player.name}</div>
                  <div>{player.isAlive ? 'Alive' : 'Eliminated'}</div>
                  <div>{player.role}</div>
                </div>
              ))}
            </div>
            
            <div className="host-controls">
              <button onClick={handleProcessNightResults}>
                Start New Day
              </button>
            </div>
          </div>
        )}
        
        {/* Game Over UI */}
        {gamePhase === PHASES.GAME_OVER && (
          <div>
            <h2>Game Over</h2>
            
            {gameResult && (
              <div className="result-card">
                <h3>Game Result</h3>
                <p>The {gameResult} have won the game!</p>
              </div>
            )}
            
            <div className="player-grid">
              {players.map(player => (
                <div 
                  key={player.id} 
                  className="player-card"
                >
                  <div>{player.name}</div>
                  <div>{player.role}</div>
                  <div>{player.isAlive ? 'Survived' : 'Eliminated'}</div>
                </div>
              ))}
            </div>
            
            <div className="host-controls">
              <button onClick={resetGame}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Host;
