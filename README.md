# Mafia Game

A simple React-based hybrid Mafia game app that helps with role assignments and vote tracking for in-person Mafia games.

## How to Use

### Setup
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start the development server
4. To deploy, run `npm run build` and publish the build directory to your web server

### Playing the Game

#### Host
1. Visit the app URL and click "Create New Game"
2. Share the session ID with your friends
3. Manually add players by entering their names
4. Set the number of each role type
5. Assign roles and start the game
6. Guide players through each phase of the game
7. Record votes and actions manually as players inform you

#### Players
1. Visit the app URL and enter the session ID provided by the host
2. Tell the host your name to be added to the game
3. View your assigned role when the game starts
4. During day phase, verbally announce your vote and note it in the app
5. During night phase, follow the host's verbal instructions

## Game Flow
1. **Setup Phase**: Host creates session, players join, roles are assigned
2. **Day Phase**: Players discuss and vote, host processes votes
3. **Night Phase**:
   - Mafia selects a victim
   - Doctor chooses someone to save
   - Police investigates a player
4. **Results Phase**: Host announces night results
5. Repeat until game end condition (Mafia equals or outnumbers villagers, or all Mafia eliminated)

## Features
- Simple React-based interface
- No backend requirement (uses localStorage)
- Works as an assistant for in-person games
- Tracks player roles, votes, and eliminations
- Guides hosts through the game flow

## Technologies Used
- React
- React Router
- Context API for state management
- localStorage for state persistence

## Hybrid Approach
This app is designed to assist with in-person Mafia games, not replace them. Players still physically open/close their eyes during the night phase and discuss verbally during the day phase. The app helps with:
- Random role assignment
- Keeping track of who is eliminated
- Vote collection
- Game state management

## Future Enhancements
- Custom role creation
- Timers for discussion and voting phases
- Game history statistics
- Support for additional Mafia game variants
