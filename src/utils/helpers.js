/**
 * Generates a random session ID
 * @returns {string} A random 6-character uppercase string
 */
export const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Finds the player with the most votes
 * @param {Object} votingResults - Object with player IDs as keys and vote counts as values
 * @returns {string|null} The ID of the player with the most votes, or null if tie or no votes
 */
export const findMostVotedPlayer = (votingResults) => {
  if (!votingResults || Object.keys(votingResults).length === 0) {
    return null;
  }

  let maxVotes = 0;
  let mostVotedId = null;
  let isTie = false;

  for (const [playerId, votes] of Object.entries(votingResults)) {
    if (votes > maxVotes) {
      maxVotes = votes;
      mostVotedId = playerId;
      isTie = false;
    } else if (votes === maxVotes) {
      isTie = true;
    }
  }

  return isTie ? null : mostVotedId;
};

/**
 * Checks if the game is over
 * @param {Array} players - Array of player objects
 * @returns {string|null} 'mafia', 'villagers', or null if game continues
 */
export const checkGameOver = (players) => {
  const alivePlayers = players.filter(p => p.isAlive);
  const mafiaCount = alivePlayers.filter(p => p.role === 'Mafia').length;
  const villagerCount = alivePlayers.length - mafiaCount;
  
  if (mafiaCount === 0) {
    return 'villagers';  // Villagers win
  }
  
  if (mafiaCount >= villagerCount) {
    return 'mafia';  // Mafia win
  }
  
  return null;  // Game continues
};

/**
 * Gets role description
 * @param {string} role - Role name
 * @returns {string} Role description
 */
export const getRoleDescription = (role) => {
  switch(role) {
    case 'Mafia':
      return 'During the night phase, choose a player to eliminate. Work with other Mafia members to avoid detection.';
    case 'Doctor':
      return 'During the night phase, choose a player to protect from elimination. You can protect yourself.';
    case 'Police':
      return 'During the night phase, choose a player to investigate. The host will tell you if they are Mafia.';
    case 'Villager':
    default:
      return 'You have no special abilities. Use your deduction skills to identify the Mafia.';
  }
};

/**
 * Gets the role icon
 * @param {string} role - Role name
 * @returns {string} Unicode icon representing the role
 */
export const getRoleIcon = (role) => {
  switch(role) {
    case 'Mafia':
      return '🔪';
    case 'Doctor':
      return '💉';
    case 'Police':
      return '🔍';
    case 'Villager':
    default:
      return '👨‍👩‍👧‍👦';
  }
};

/**
 * Gets the phase description
 * @param {string} phase - Game phase
 * @returns {string} Phase description
 */
export const getPhaseDescription = (phase) => {
  switch(phase) {
    case 'setup':
      return 'Setting up the game. The host will assign roles.';
    case 'day':
      return 'Day phase: Discuss and vote for who you suspect is the Mafia.';
    case 'night_mafia':
      return 'Night phase: Mafia, open your eyes and choose a victim.';
    case 'night_doctor':
      return 'Night phase: Doctor, open your eyes and choose someone to save.';
    case 'night_police':
      return 'Night phase: Police, open your eyes and choose someone to investigate.';
    case 'results':
      return 'Results phase: Let\'s see what happened overnight.';
    case 'game_over':
      return 'Game over!';
    default:
      return 'Unknown phase';
  }
};
