import { createContext, useContext, useState, useEffect } from 'react';

// Define available roles
export const ROLES = {
  VILLAGER: 'Villager',
  MAFIA: 'Mafia',
  DOCTOR: 'Doctor',
  POLICE: 'Police'
};

// Define game phases
export const PHASES = {
  SETUP: 'setup',
  DAY: 'day',
  NIGHT_MAFIA: 'night_mafia',
  NIGHT_DOCTOR: 'night_doctor',
  NIGHT_POLICE: 'night_police',
  RESULTS: 'results',
  GAME_OVER: 'game_over'
};

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('mafia_session_id') || '';
  });
  
  const [isHost, setIsHost] = useState(() => {
    return localStorage.getItem('mafia_is_host') === 'true';
  });
  
  const [players, setPlayers] = useState(() => {
    const savedPlayers = localStorage.getItem('mafia_players');
    return savedPlayers ? JSON.parse(savedPlayers) : [];
  });
  
  const [gamePhase, setGamePhase] = useState(() => {
    return localStorage.getItem('mafia_game_phase') || PHASES.SETUP;
  });
  
  const [roleCount, setRoleCount] = useState(() => {
    const savedCount = localStorage.getItem('mafia_role_count');
    return savedCount ? JSON.parse(savedCount) : {
      [ROLES.VILLAGER]: 0,
      [ROLES.MAFIA]: 0,
      [ROLES.DOCTOR]: 0,
      [ROLES.POLICE]: 0
    };
  });
  
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [votingResults, setVotingResults] = useState({});
  const [currentPlayerId, setCurrentPlayerId] = useState(() => {
    return localStorage.getItem('mafia_player_id') || '';
  });

  // Persist state to localStorage
  useEffect(() => {
    if (sessionId) localStorage.setItem('mafia_session_id', sessionId);
    localStorage.setItem('mafia_is_host', isHost.toString());
    localStorage.setItem('mafia_players', JSON.stringify(players));
    localStorage.setItem('mafia_game_phase', gamePhase);
    localStorage.setItem('mafia_role_count', JSON.stringify(roleCount));
    if (currentPlayerId) localStorage.setItem('mafia_player_id', currentPlayerId);
  }, [sessionId, isHost, players, gamePhase, roleCount, currentPlayerId]);

  // Create a new game session
  const createSession = () => {
    const newSessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionId(newSessionId);
    setIsHost(true);
    setPlayers([]);
    setGamePhase(PHASES.SETUP);
    return newSessionId;
  };

  // Join an existing session
  const joinSession = (session, playerName) => {
    setSessionId(session);
    setIsHost(false);
    
    // Generate a player ID
    const playerId = `player_${Date.now()}`;
    setCurrentPlayerId(playerId);
    
    // Store player info locally only
    const playerInfo = { id: playerId, name: playerName, role: '', isAlive: true };
    localStorage.setItem('mafia_player_info', JSON.stringify(playerInfo));
    
    return playerId;
  };

  // Host manually adds a player
  const approvePlayer = (playerName) => {
    const playerId = `player_${Date.now()}`;
    const newPlayer = { id: playerId, name: playerName, role: '', isAlive: true, votes: 0 };
    setPlayers(prev => [...prev, newPlayer]);
    return newPlayer;
  };

  // Assign roles randomly
  const assignRoles = () => {
    if (!isHost) return;
    
    // Create an array with the correct number of each role
    let roleArray = [];
    Object.entries(roleCount).forEach(([role, count]) => {
      for (let i = 0; i < count; i++) {
        roleArray.push(role);
      }
    });
    
    // Shuffle the array
    for (let i = roleArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roleArray[i], roleArray[j]] = [roleArray[j], roleArray[i]];
    }
    
    // Assign to players
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      role: roleArray[index] || ROLES.VILLAGER, // Default to villager if not enough roles
    }));
    
    setPlayers(updatedPlayers);
  };

  // Start the game
  const startGame = () => {
    if (!isHost) return;
    setGamePhase(PHASES.DAY);
  };

  // Submit a vote (for day phase) - only stores locally for the player
  const submitVote = (votedForId) => {
    if (gamePhase !== PHASES.DAY) return;
    
    // Only store the vote locally for the player to remember
    localStorage.setItem('mafia_player_vote', votedForId);
  };

  // Host manually records votes
  const recordVote = (playerId, votedForId) => {
    if (!isHost) return;
    
    // Manually track votes
    setVotingResults(prev => {
      const newResults = {...prev};
      newResults[votedForId] = (newResults[votedForId] || 0) + 1;
      return newResults;
    });
  };
  
  // Host collects votes - now just returns the current voting results
  const collectVotes = () => {
    if (!isHost) return;
    return votingResults;
  };

  // Eliminate a player
  const eliminatePlayer = (playerId) => {
    if (!isHost) return;
    
    setPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, isAlive: false } 
          : player
      )
    );
  };

  // Advance to next game phase
  const nextPhase = () => {
    if (!isHost) return;
    
    const phaseOrder = [
      PHASES.DAY,
      PHASES.NIGHT_MAFIA,
      PHASES.NIGHT_DOCTOR,
      PHASES.NIGHT_POLICE,
      PHASES.RESULTS,
    ];
    
    const currentIndex = phaseOrder.indexOf(gamePhase);
    if (currentIndex >= 0 && currentIndex < phaseOrder.length - 1) {
      setGamePhase(phaseOrder[currentIndex + 1]);
    } else {
      // Loop back to day
      setGamePhase(PHASES.DAY);
    }
  };

  // Check if game is over
  const checkGameOver = () => {
    if (!isHost) return null;
    
    const alivePlayers = players.filter(p => p.isAlive);
    const mafiaCount = alivePlayers.filter(p => p.role === ROLES.MAFIA).length;
    const villagerCount = alivePlayers.length - mafiaCount;
    
    if (mafiaCount === 0) {
      setGamePhase(PHASES.GAME_OVER);
      return 'villagers';  // Villagers win
    }
    
    if (mafiaCount >= villagerCount) {
      setGamePhase(PHASES.GAME_OVER);
      return 'mafia';  // Mafia win
    }
    
    return null;  // Game continues
  };

  // Reset the game
  const resetGame = () => {
    if (isHost) {
      setPlayers(prev => prev.map(player => ({ ...player, role: '', isAlive: true })));
      setGamePhase(PHASES.SETUP);
      setVotingResults({});
      setSelectedPlayerId(null);
    } else {
      // Clear player data
      setCurrentPlayerId('');
      localStorage.removeItem('mafia_player_id');
    }
  };

  // Get player info
  const getPlayerInfo = () => {
    const playerInfoString = localStorage.getItem('mafia_player_info');
    return playerInfoString ? JSON.parse(playerInfoString) : null;
  };

  // Get the current player's role (for player view)
  const getCurrentPlayerRole = () => {
    // Get player info from localStorage
    const playerInfo = getPlayerInfo();
    return playerInfo ? playerInfo.role : null;
  };
  
  // Update current player's role (when host assigns roles)
  const updatePlayerRole = (role) => {
    const playerInfo = getPlayerInfo();
    if (playerInfo) {
      playerInfo.role = role;
      localStorage.setItem('mafia_player_info', JSON.stringify(playerInfo));
    }
  };

  return (
    <GameContext.Provider value={{
      sessionId,
      isHost,
      players,
      gamePhase,
      roleCount,
      selectedPlayerId,
      votingResults,
      currentPlayerId,
      createSession,
      joinSession,
      approvePlayer,
      assignRoles,
      startGame,
      submitVote,
      collectVotes,
      eliminatePlayer,
      nextPhase,
      checkGameOver,
      resetGame,
      setRoleCount,
      setSelectedPlayerId,
      getPlayerInfo,
      getCurrentPlayerRole,
      updatePlayerRole,
      recordVote
    }}>
      {children}
    </GameContext.Provider>
  );
};
