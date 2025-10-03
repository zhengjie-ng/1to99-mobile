# Multiplayer Guess the Number Game Tutorial

## Introduction

This tutorial will guide you through creating a real-time multiplayer guessing game using WebSocket technology. We'll build:
- **Frontend**: React.js with Vite and STOMP client
- **Backend**: Spring Boot with WebSocket and STOMP messaging

## What You'll Learn

- WebSocket fundamentals and real-time communication
- STOMP (Simple Text Oriented Message Protocol)
- Spring Boot WebSocket configuration
- React WebSocket client implementation
- Game state management across multiple clients

## Prerequisites

- Java 17+
- Node.js 18+
- Basic knowledge of React and Spring Boot

## Part 1: Understanding WebSockets and STOMP

### WebSocket Basics
WebSockets provide full-duplex communication between client and server, perfect for real-time applications like games. Unlike HTTP requests, WebSockets maintain a persistent connection.

**Key Differences from HTTP:**
- **HTTP**: Request → Response (one-time communication)
- **WebSocket**: Persistent connection allowing bi-directional real-time communication

**Benefits:**
- **Low Latency**: No need to establish new connections for each message
- **Real-time Updates**: Server can push data to clients instantly
- **Efficient**: Reduces server overhead compared to polling

### STOMP Protocol
STOMP (Simple Text Oriented Message Protocol) is a messaging protocol that works over WebSockets. It provides:
- **Destinations**: Like topics or queues (`/topic/game`, `/queue/user`)
- **Subscriptions**: Clients subscribe to destinations
- **Message Broadcasting**: Send messages to all subscribers

**STOMP Message Flow:**
1. Client connects to WebSocket endpoint
2. Client subscribes to topics/queues of interest
3. Server broadcasts messages to subscribed clients
4. Client receives and processes messages in real-time

**Topic vs Queue:**
- **Topic (`/topic/*)**: Broadcast to all subscribers (1-to-many)
- **Queue (`/queue/*)**: Point-to-point messaging (1-to-1)

## Part 2: Backend - Spring Boot WebSocket Server

### Step 1: Create Spring Boot Project

Create a new Spring Boot project with these dependencies:
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-messaging</artifactId>
    </dependency>
</dependencies>
```

### Step 2: WebSocket Configuration

Create `WebSocketConfig.java`:

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for topics and queues
        config.enableSimpleBroker("/topic", "/queue");
        // Set application destination prefix
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register STOMP endpoint with SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Add native WebSocket endpoint for React Native
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }
}
```

**Explanation**:
- `@EnableWebSocketMessageBroker`: Enables WebSocket message handling with message broker
- `/topic`: For broadcasting to multiple subscribers (game room updates)
- `/queue`: For point-to-point messaging (personal notifications)
- `/app`: Prefix for messages bound to controller methods
- `/ws`: WebSocket endpoint URL that clients connect to
- `withSockJS()`: Provides fallback options for browsers that don't support WebSocket
- `setAllowedOriginPatterns("*")`: Allows connections from any origin (use specific domains in production)

### Step 3: Game Models

Create game-related POJOs:

```java
// Player.java
public class Player {
    private String id;
    private String name;
    private boolean isHost;

    public Player() {}

    public Player(String id, String name, boolean isHost) {
        this.id = id;
        this.name = name;
        this.isHost = isHost;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isHost() { return isHost; }
    public void setHost(boolean host) { isHost = host; }
}

// GameRoom.java
public class GameRoom {
    private String roomId;
    private String hostId;
    private List<Player> players = new ArrayList<>();
    private GameState state = GameState.WAITING_FOR_PLAYERS;
    private int secretNumber;
    private int currentPlayerIndex = 0;
    private int minRange = 1;
    private int maxRange = 99;
    private List<GameTurn> gameHistory = new ArrayList<>();

    // Constructors, getters, setters
    public GameRoom() {}

    // All getters and setters...
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public List<Player> getPlayers() { return players; }
    public void setPlayers(List<Player> players) { this.players = players; }

    // ... other getters/setters
}

// GameTurn.java
public class GameTurn {
    private String playerId;
    private String playerName;
    private int guess;
    private String result;
    private long timestamp;

    public GameTurn() {}

    // All getters and setters...
    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public int getGuess() { return guess; }
    public void setGuess(int guess) { this.guess = guess; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}

// GameState enum
public enum GameState {
    WAITING_FOR_PLAYERS,
    IN_PROGRESS,
    FINISHED
}
```

### Step 4: Message DTOs

Create message objects for client-server communication:

```java
// CreateRoomMessage.java
public class CreateRoomMessage {
    private String playerName;
    private String tempPlayerId; // For subscription routing

    public CreateRoomMessage() {}

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public String getTempPlayerId() { return tempPlayerId; }
    public void setTempPlayerId(String tempPlayerId) { this.tempPlayerId = tempPlayerId; }
}

// JoinRoomMessage.java
public class JoinRoomMessage {
    private String roomId;
    private String playerName;

    public JoinRoomMessage() {}

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }
}

// GuessMessage.java
public class GuessMessage {
    private String roomId;
    private int guess;

    public GuessMessage() {}

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public int getGuess() { return guess; }
    public void setGuess(int guess) { this.guess = guess; }
}

// GameUpdateMessage.java
public class GameUpdateMessage {
    private String type; // "ROOM_CREATED", "PLAYER_JOINED", "GAME_STARTED", etc.
    private GameRoom gameRoom;
    private String message;
    private GameTurn lastTurn;

    public GameUpdateMessage() {}

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public GameRoom getGameRoom() { return gameRoom; }
    public void setGameRoom(GameRoom gameRoom) { this.gameRoom = gameRoom; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public GameTurn getLastTurn() { return lastTurn; }
    public void setLastTurn(GameTurn lastTurn) { this.lastTurn = lastTurn; }
}
```

### Step 5: Game Service

Create `GameService.java` to manage game logic:

```java
@Service
public class GameService {
    private final Map<String, GameRoom> gameRooms = new ConcurrentHashMap<>();
    private final Map<String, String> playerRoomMap = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public GameRoom createRoom(String hostName) {
        String roomId = generateRoomId();
        String hostId = UUID.randomUUID().toString();

        Player host = new Player(hostId, hostName, true);
        GameRoom room = new GameRoom();
        room.setRoomId(roomId);
        room.setHostId(hostId);
        room.getPlayers().add(host);
        room.setState(GameState.WAITING_FOR_PLAYERS);

        gameRooms.put(roomId, room);
        playerRoomMap.put(hostId, roomId);

        return room;
    }

    public GameRoom joinRoom(String roomId, String playerName) throws GameException {
        GameRoom room = gameRooms.get(roomId);
        if (room == null) {
            throw new GameException("Room not found");
        }
        if (room.getState() != GameState.WAITING_FOR_PLAYERS) {
            throw new GameException("Game already started");
        }

        String playerId = UUID.randomUUID().toString();
        Player player = new Player(playerId, playerName, false);
        room.getPlayers().add(player);
        playerRoomMap.put(playerId, roomId);

        return room;
    }

    public GameRoom startGame(String roomId, String hostId) throws GameException {
        GameRoom room = gameRooms.get(roomId);
        if (room == null || !room.getHostId().equals(hostId)) {
            throw new GameException("Unauthorized or room not found");
        }
        if (room.getPlayers().size() < 2) {
            throw new GameException("Need at least 2 players to start");
        }

        room.setSecretNumber(random.nextInt(99) + 1);
        room.setMinRange(1);
        room.setMaxRange(99);
        room.setCurrentPlayerIndex(0);
        room.setState(GameState.IN_PROGRESS);
        room.getGameHistory().clear();

        return room;
    }

    public GameTurn makeGuess(String roomId, String playerId, int guess) throws GameException {
        GameRoom room = gameRooms.get(roomId);
        if (room == null || room.getState() != GameState.IN_PROGRESS) {
            throw new GameException("Invalid game state");
        }

        Player currentPlayer = room.getPlayers().get(room.getCurrentPlayerIndex());
        if (!currentPlayer.getId().equals(playerId)) {
            throw new GameException("Not your turn");
        }

        if (guess < room.getMinRange() || guess > room.getMaxRange()) {
            throw new GameException("Guess out of range");
        }

        GameTurn turn = new GameTurn();
        turn.setPlayerId(playerId);
        turn.setPlayerName(currentPlayer.getName());
        turn.setGuess(guess);
        turn.setTimestamp(System.currentTimeMillis());

        // Game Logic: The player who guesses the secret number LOSES!
        if (guess == room.getSecretNumber()) {
            turn.setResult("GAME OVER! " + currentPlayer.getName() + " guessed the secret number and LOSES!");
            room.setState(GameState.FINISHED);
        } else if (guess < room.getSecretNumber()) {
            room.setMinRange(guess + 1);
            turn.setResult("Higher! Range: " + room.getMinRange() + "-" + room.getMaxRange());
            moveToNextPlayer(room);
        } else {
            room.setMaxRange(guess - 1);
            turn.setResult("Lower! Range: " + room.getMinRange() + "-" + room.getMaxRange());
            moveToNextPlayer(room);
        }

        room.getGameHistory().add(turn);
        return turn;
    }

    public GameRoom getRoom(String roomId) {
        return gameRooms.get(roomId);
    }

    public GameRoom playerQuitGame(String roomId, String playerName) throws GameException {
        GameRoom room = gameRooms.get(roomId);
        if (room == null) {
            throw new GameException("Room not found");
        }

        // Remove player from room
        room.getPlayers().removeIf(p -> p.getName().equals(playerName));

        // If room is empty, remove it
        if (room.getPlayers().isEmpty()) {
            gameRooms.remove(roomId);
            return null;
        }

        // If host left, assign new host
        if (room.getPlayers().stream().noneMatch(Player::isHost)) {
            room.getPlayers().get(0).setHost(true);
            room.setHostId(room.getPlayers().get(0).getId());
        }

        return room;
    }

    public GameRoom restartGame(String roomId, String hostId) throws GameException {
        GameRoom room = gameRooms.get(roomId);
        if (room == null || !room.getHostId().equals(hostId)) {
            throw new GameException("Unauthorized or room not found");
        }

        room.setState(GameState.WAITING_FOR_PLAYERS);
        room.setSecretNumber(0);
        room.setCurrentPlayerIndex(0);
        room.setMinRange(1);
        room.setMaxRange(99);
        room.getGameHistory().clear();

        return room;
    }

    private void moveToNextPlayer(GameRoom room) {
        int nextIndex = (room.getCurrentPlayerIndex() + 1) % room.getPlayers().size();
        room.setCurrentPlayerIndex(nextIndex);
    }

    private String generateRoomId() {
        return String.valueOf(random.nextInt(9000) + 1000);
    }
}

// Custom exception class
public class GameException extends Exception {
    public GameException(String message) {
        super(message);
    }
}
```

**Key Game Logic Points:**
- **Competitive Nature**: Player who guesses the secret number loses
- **Range Narrowing**: Each wrong guess narrows the range
- **Turn Management**: Players take turns in sequence
- **Room Management**: Host controls and player lifecycle

### Step 6: WebSocket Controller

Create `GameController.java` to handle WebSocket messages:

```java
@Controller
public class GameController {

    @Autowired
    private GameService gameService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/createRoom")
    public void createRoom(@Payload CreateRoomMessage message, SimpMessageHeaderAccessor headerAccessor) {
        try {
            GameRoom room = gameService.createRoom(message.getPlayerName());

            // Store player ID in session for future requests
            headerAccessor.getSessionAttributes().put("playerId", room.getHostId());

            // Send room created confirmation to the host
            GameUpdateMessage update = new GameUpdateMessage();
            update.setType("ROOM_CREATED");
            update.setGameRoom(room);
            update.setMessage("Room created successfully");

            // Send to user-specific topic using tempPlayerId
            String userTopicId = message.getTempPlayerId() != null ?
                message.getTempPlayerId() : room.getHostId();
            messagingTemplate.convertAndSend("/topic/user." + userTopicId, update);

            // Also send to room topic for future messages
            messagingTemplate.convertAndSend("/topic/room." + room.getRoomId(), update);

        } catch (Exception e) {
            sendError(headerAccessor.getSessionId(), e.getMessage());
        }
    }

    @MessageMapping("/joinRoom")
    public void joinRoom(@Payload JoinRoomMessage message, SimpMessageHeaderAccessor headerAccessor) {
        try {
            GameRoom room = gameService.joinRoom(message.getRoomId(), message.getPlayerName());

            // Find the new player and store ID in session
            String playerId = room.getPlayers().stream()
                .filter(p -> p.getName().equals(message.getPlayerName()))
                .findFirst()
                .map(Player::getId)
                .orElse(null);

            headerAccessor.getSessionAttributes().put("playerId", playerId);

            // Broadcast player joined to all players in the room
            GameUpdateMessage update = new GameUpdateMessage();
            update.setType("PLAYER_JOINED");
            update.setGameRoom(room);
            update.setMessage(message.getPlayerName() + " joined the game");

            messagingTemplate.convertAndSend("/topic/room." + room.getRoomId(), update);

        } catch (Exception e) {
            sendError(headerAccessor.getSessionId(), e.getMessage());
        }
    }

    @MessageMapping("/startGameCountdown")
    public void startGameCountdown(@Payload Map<String, String> message, SimpMessageHeaderAccessor headerAccessor) {
        try {
            String roomId = message.get("roomId");
            String playerId = (String) headerAccessor.getSessionAttributes().get("playerId");

            GameRoom room = gameService.getRoom(roomId);
            if (room == null || !room.getHostId().equals(playerId)) {
                throw new GameException("Unauthorized or room not found");
            }

            // Broadcast countdown start to all players
            GameUpdateMessage update = new GameUpdateMessage();
            update.setType("GAME_STARTING_COUNTDOWN");
            update.setGameRoom(room);
            update.setMessage("Game starting in 5 seconds...");

            messagingTemplate.convertAndSend("/topic/room." + roomId, update);

            // Schedule the actual game start after 5 seconds
            Timer timer = new Timer();
            timer.schedule(new TimerTask() {
                @Override
                public void run() {
                    try {
                        GameRoom startedRoom = gameService.startGame(roomId, playerId);

                        GameUpdateMessage startUpdate = new GameUpdateMessage();
                        startUpdate.setType("GAME_STARTED");
                        startUpdate.setGameRoom(startedRoom);
                        startUpdate.setMessage("Game started! Try not to guess the secret number!");

                        messagingTemplate.convertAndSend("/topic/room." + roomId, startUpdate);
                    } catch (Exception e) {
                        System.err.println("Error starting game after countdown: " + e.getMessage());
                    }
                }
            }, 5000);

        } catch (Exception e) {
            sendError(headerAccessor.getSessionId(), e.getMessage());
        }
    }

    @MessageMapping("/makeGuess")
    public void makeGuess(@Payload GuessMessage message, SimpMessageHeaderAccessor headerAccessor) {
        try {
            String playerId = (String) headerAccessor.getSessionAttributes().get("playerId");
            GameTurn turn = gameService.makeGuess(message.getRoomId(), playerId, message.getGuess());

            GameRoom room = gameService.getRoom(message.getRoomId());

            GameUpdateMessage update = new GameUpdateMessage();
            update.setType("GUESS_MADE");
            update.setGameRoom(room);
            update.setLastTurn(turn);
            update.setMessage(turn.getPlayerName() + " guessed " + turn.getGuess());

            messagingTemplate.convertAndSend("/topic/room." + message.getRoomId(), update);

        } catch (Exception e) {
            sendError(headerAccessor.getSessionId(), e.getMessage());
        }
    }

    @MessageMapping("/quitGame")
    public void quitGame(@Payload QuitGameMessage message, SimpMessageHeaderAccessor headerAccessor) {
        try {
            GameRoom room = gameService.playerQuitGame(message.getRoomId(), message.getPlayerName());

            if (room != null && !room.getPlayers().isEmpty()) {
                GameUpdateMessage update = new GameUpdateMessage();
                update.setType("PLAYER_QUIT");
                update.setGameRoom(room);
                update.setMessage(message.getPlayerName() + " left the game");

                messagingTemplate.convertAndSend("/topic/room." + room.getRoomId(), update);
            }

        } catch (Exception e) {
            sendError(headerAccessor.getSessionId(), e.getMessage());
        }
    }

    @MessageMapping("/restartGame")
    public void restartGame(@Payload Map<String, String> message, SimpMessageHeaderAccessor headerAccessor) {
        try {
            String roomId = message.get("roomId");
            String playerId = (String) headerAccessor.getSessionAttributes().get("playerId");

            GameRoom room = gameService.restartGame(roomId, playerId);

            GameUpdateMessage update = new GameUpdateMessage();
            update.setType("GAME_RESTARTED");
            update.setGameRoom(room);
            update.setMessage("Game has been restarted. Waiting for players to join!");

            messagingTemplate.convertAndSend("/topic/room." + roomId, update);

        } catch (Exception e) {
            sendError(headerAccessor.getSessionId(), e.getMessage());
        }
    }

    private void sendError(String sessionId, String errorMessage) {
        GameUpdateMessage error = new GameUpdateMessage();
        error.setType("ERROR");
        error.setMessage(errorMessage);
        messagingTemplate.convertAndSendToUser(sessionId, "/queue/gameUpdate", error);
    }
}
```

**Key Concepts Explained**:
- `@MessageMapping`: Maps client messages to handler methods (like REST endpoints for WebSocket)
- `@Payload`: Extracts message payload and converts from JSON
- `SimpMessageHeaderAccessor`: Access WebSocket session information and attributes
- `SimpMessagingTemplate`: Send messages to clients (similar to RestTemplate for WebSocket)
- `/topic/room.{roomId}`: Room-specific topic for broadcasting to all players in a room
- `/queue/gameUpdate`: Personal queue for individual messages
- Session Management: Store player info in WebSocket session for authorization

## Part 3: Frontend - React WebSocket Client

### Step 1: Create Vite React Project

```bash
npm create vite@latest guess-number-frontend -- --template react
cd guess-number-frontend
npm install @stomp/stompjs sockjs-client
```

### Step 2: WebSocket Service

Create `src/services/WebSocketService.js`:

```javascript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();

    // Configure WebSocket URL (can be environment variable)
    this.wsUrl = 'http://localhost:8080/ws';
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log('Attempting to connect to WebSocket...');

      // Create STOMP client with SockJS transport
      this.client = new Client({
        webSocketFactory: () => {
          console.log(`Creating SockJS connection to: ${this.wsUrl}`);
          return new SockJS(this.wsUrl);
        },
        reconnectDelay: 5000,           // Auto-reconnect after 5 seconds
        heartbeatIncoming: 10000,       // Expect heartbeat every 10 seconds
        heartbeatOutgoing: 10000,       // Send heartbeat every 10 seconds
        debug: (str) => console.log('STOMP: ' + str),

        onConnect: (frame) => {
          console.log('STOMP Connected successfully:', frame);
          this.connected = true;
          resolve();
        },

        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message']);
          console.error('Full STOMP error frame:', frame);
          reject(frame.headers['message']);
        },

        onWebSocketError: (event) => {
          console.error('WebSocket error:', event);
          reject('WebSocket connection failed');
        },

        onDisconnect: (frame) => {
          console.log('STOMP Disconnected:', frame);
          this.connected = false;
        }
      });

      console.log('Activating STOMP client...');
      this.client.activate();
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  // Subscribe to a destination with callback
  subscribe(destination, callback) {
    if (!this.connected) {
      throw new Error('WebSocket not connected');
    }

    // Check if already subscribed to prevent duplicates
    if (this.subscriptions.has(destination)) {
      console.log(`Already subscribed to ${destination}, skipping duplicate subscription`);
      return this.subscriptions.get(destination);
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        console.log(`Raw message received on ${destination}:`, message.body);
        const parsedMessage = JSON.parse(message.body);
        console.log(`Parsed message on ${destination}:`, parsedMessage);
        callback(parsedMessage);
      } catch (error) {
        console.error(`Error parsing message on ${destination}:`, error, message.body);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log(`Subscribed to: ${destination}`);
    return subscription;
  }

  // Unsubscribe from a destination
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`Unsubscribed from: ${destination}`);
    }
  }

  // Send message to server
  send(destination, message) {
    if (!this.connected) {
      throw new Error('WebSocket not connected');
    }

    const messageBody = JSON.stringify(message);
    console.log(`Sending to ${destination}:`, messageBody);

    this.client.publish({
      destination,
      body: messageBody
    });
  }
}

export default new WebSocketService();
```

**WebSocket Service Explanation:**
- **Singleton Pattern**: Single instance manages all WebSocket communication
- **SockJS**: Provides WebSocket with fallback support for older browsers
- **Auto-reconnection**: Automatically reconnects if connection is lost
- **Heartbeat**: Maintains connection health with ping/pong messages
- **Subscription Management**: Tracks active subscriptions to prevent duplicates
- **Error Handling**: Comprehensive error handling for connection issues

### Step 3: Game Context

Create `src/context/GameContext.js` for state management:

```javascript
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import WebSocketService from '../services/WebSocketService';

const GameContext = createContext();

const initialState = {
  connected: false,
  playerName: '',
  gameRoom: null,
  gameHistory: [],
  currentTurn: null,
  error: null,
  gameState: 'MENU', // MENU, LOBBY, PLAYING, FINISHED
  countdown: 0,
  isCountingDown: false
};

function gameReducer(state, action) {
  console.log('GameReducer - Action:', action.type, action.payload);
  console.log('GameReducer - Current state:', state.gameState);

  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload };

    case 'SET_PLAYER_NAME':
      return { ...state, playerName: action.payload };

    case 'SET_GAME_ROOM':
      return { ...state, gameRoom: action.payload };

    case 'SET_GAME_STATE':
      console.log('GameReducer - Setting game state from', state.gameState, 'to', action.payload);
      return { ...state, gameState: action.payload };

    case 'ADD_GAME_TURN':
      return {
        ...state,
        gameHistory: [...state.gameHistory, action.payload],
        currentTurn: action.payload
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'START_COUNTDOWN':
      return {
        ...state,
        countdown: action.payload,
        isCountingDown: true
      };

    case 'UPDATE_COUNTDOWN':
      return {
        ...state,
        countdown: action.payload
      };

    case 'END_COUNTDOWN':
      return {
        ...state,
        countdown: 0,
        isCountingDown: false
      };

    case 'CLEAR_GAME_HISTORY':
      return {
        ...state,
        gameHistory: [],
        currentTurn: null
      };

    case 'RESET_GAME':
      return {
        ...initialState,
        connected: state.connected,
        playerName: state.playerName
      };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    connectWebSocket();
    return () => WebSocketService.disconnect();
  }, []);

  const connectWebSocket = async () => {
    try {
      await WebSocketService.connect();
      dispatch({ type: 'SET_CONNECTED', payload: true });

      // Subscribe to personal queue for game updates
      WebSocketService.subscribe('/user/queue/gameUpdate', handleGameUpdate);
      console.log('Subscribed to /user/queue/gameUpdate');

      // Subscribe to general game response topic for room creation
      WebSocketService.subscribe('/topic/gameResponse', handleGameUpdate);
      console.log('Subscribed to /topic/gameResponse');

    } catch (error) {
      console.log(error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to server' });
    }
  };

  const handleGameUpdate = (message) => {
    console.log('Game update:', message);

    switch (message.type) {
      case 'ROOM_CREATED':
        dispatch({ type: 'SET_GAME_ROOM', payload: message.gameRoom });
        dispatch({ type: 'SET_GAME_STATE', payload: 'LOBBY' });
        subscribeToRoom(message.gameRoom.roomId);
        // Subscribe to personal topic using host ID
        subscribeToUserTopic(message.gameRoom.hostId);
        break;

      case 'PLAYER_JOINED':
        console.log('Processing PLAYER_JOINED message:', message);
        dispatch({ type: 'SET_GAME_ROOM', payload: message.gameRoom });
        // Set to lobby state for joining player
        if (message.gameRoom && (state.gameState === 'MENU' || !state.gameRoom)) {
          console.log('Setting game state to LOBBY');
          dispatch({ type: 'SET_GAME_STATE', payload: 'LOBBY' });
          // Subscribe to personal topic for the joining player
          const joinedPlayer = message.gameRoom.players.find(p => p.name === state.playerName);
          if (joinedPlayer) {
            subscribeToUserTopic(joinedPlayer.id);
          }
        }
        break;

      case 'GAME_STARTING_COUNTDOWN':
        console.log('Game starting countdown...');
        dispatch({ type: 'SET_GAME_ROOM', payload: message.gameRoom });
        startCountdown();
        break;

      case 'GAME_STARTED':
        console.log('🎯 SECRET NUMBER FOR TESTING:', message.gameRoom.secretNumber);
        dispatch({ type: 'END_COUNTDOWN' });
        dispatch({ type: 'CLEAR_GAME_HISTORY' });
        dispatch({ type: 'SET_GAME_ROOM', payload: message.gameRoom });
        dispatch({ type: 'SET_GAME_STATE', payload: 'PLAYING' });
        break;

      case 'GUESS_MADE':
        dispatch({ type: 'SET_GAME_ROOM', payload: message.gameRoom });
        dispatch({ type: 'ADD_GAME_TURN', payload: message.lastTurn });

        if (message.gameRoom.state === 'FINISHED') {
          dispatch({ type: 'SET_GAME_STATE', payload: 'FINISHED' });
        }
        break;

      case 'PLAYER_QUIT':
        dispatch({ type: 'SET_GAME_ROOM', payload: message.gameRoom });
        break;

      case 'GAME_RESTARTED':
        console.log('Game restarted, returning to lobby:', message);
        dispatch({ type: 'CLEAR_GAME_HISTORY' });
        dispatch({ type: 'SET_GAME_ROOM', payload: message.gameRoom });
        dispatch({ type: 'SET_GAME_STATE', payload: 'LOBBY' });
        break;

      case 'ERROR':
        console.log('Received ERROR message:', message.message);
        dispatch({ type: 'SET_ERROR', payload: message.message });
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const subscribeToRoom = (roomId) => {
    console.log('Subscribing to room topic:', `/topic/room.${roomId}`);
    WebSocketService.subscribe(`/topic/room.${roomId}`, (message) => {
      console.log(`Received message on /topic/room.${roomId}:`, message);
      handleGameUpdate(message);
    });
  };

  const subscribeToUserTopic = (playerId) => {
    console.log('Subscribing to user topic:', `/topic/user.${playerId}`);
    WebSocketService.subscribe(`/topic/user.${playerId}`, (message) => {
      console.log(`Received message on /topic/user.${playerId}:`, message);
      handleGameUpdate(message);
    });
  };

  const startCountdown = () => {
    let count = 5;
    dispatch({ type: 'START_COUNTDOWN', payload: count });

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        dispatch({ type: 'UPDATE_COUNTDOWN', payload: count });
      } else {
        dispatch({ type: 'END_COUNTDOWN' });
        clearInterval(interval);
      }
    }, 1000);
  };

  const createRoom = (playerName) => {
    console.log('Creating room for player:', playerName);
    dispatch({ type: 'SET_PLAYER_NAME', payload: playerName });

    // Check if WebSocket is connected before sending
    if (!state.connected) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Not connected to server. Please wait and try again.'
      });
      return;
    }

    try {
      // Generate a temporary player ID for subscription purposes
      const tempPlayerId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Subscribe to user-specific topic to receive ROOM_CREATED response
      console.log('Subscribing to user-specific topic:', `/topic/user.${tempPlayerId}`);
      WebSocketService.subscribe(`/topic/user.${tempPlayerId}`, (message) => {
        console.log(`Received message on user topic:`, message);
        handleGameUpdate(message);
      });

      WebSocketService.send('/app/createRoom', { playerName, tempPlayerId });
      console.log('Sent createRoom message with tempPlayerId:', tempPlayerId);
    } catch (error) {
      console.error('Failed to send createRoom message:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to create room: ' + error.message
      });
    }
  };

  const joinRoom = (roomId, playerName) => {
    console.log('Joining room:', roomId, 'with player:', playerName);
    dispatch({ type: 'SET_PLAYER_NAME', payload: playerName });

    // Check if WebSocket is connected before sending
    if (!state.connected) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Not connected to server. Please wait and try again.'
      });
      return;
    }

    try {
      // Subscribe to room topic BEFORE sending join request to avoid race condition
      subscribeToRoom(roomId);

      WebSocketService.send('/app/joinRoom', { roomId, playerName });
      console.log('Sent joinRoom message');

      // Set a timeout to handle case where no response comes back
      setTimeout(() => {
        if (state.gameState === 'MENU' && !state.gameRoom) {
          dispatch({
            type: 'SET_ERROR',
            payload: 'Room not found - Please enter an existing Room ID'
          });
        }
      }, 5000);

    } catch (error) {
      console.error('Failed to send joinRoom message:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to join room: ' + error.message
      });
    }
  };

  const startGame = () => {
    if (state.gameRoom) {
      WebSocketService.send('/app/startGameCountdown', {
        roomId: state.gameRoom.roomId
      });
    }
  };

  const makeGuess = (guess) => {
    if (state.gameRoom) {
      WebSocketService.send('/app/makeGuess', {
        roomId: state.gameRoom.roomId,
        guess: parseInt(guess)
      });
    }
  };

  const quitGame = () => {
    if (state.gameRoom) {
      // Send quit message to server
      WebSocketService.send('/app/quitGame', {
        roomId: state.gameRoom.roomId,
        playerName: state.playerName
      });
      console.log('Sent quitGame message for player:', state.playerName);

      // Unsubscribe from room topic
      WebSocketService.unsubscribe(`/topic/room.${state.gameRoom.roomId}`);

      // Unsubscribe from personal topic if we have player info
      const currentPlayer = state.gameRoom.players?.find(p => p.name === state.playerName);
      if (currentPlayer) {
        WebSocketService.unsubscribe(`/topic/user.${currentPlayer.id}`);
      }
    }
    // Reset local state immediately
    dispatch({ type: 'RESET_GAME' });
  };

  const restartGame = () => {
    if (state.gameRoom) {
      WebSocketService.send('/app/restartGame', {
        roomId: state.gameRoom.roomId
      });
      console.log('Sent restartGame message for room:', state.gameRoom.roomId);
    }
  };

  const value = {
    ...state,
    createRoom,
    joinRoom,
    startGame,
    makeGuess,
    quitGame,
    restartGame,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
```

**Game Context Explanation:**
- **useReducer**: Manages complex game state with actions
- **Multiple Subscriptions**: Handles different types of messages (personal, room-wide)
- **Connection Management**: Ensures WebSocket is connected before sending messages
- **Error Handling**: Graceful error handling with user feedback
- **State Synchronization**: Keeps all clients in sync through message handling

### Step 4: UI Components

Create the main menu component `src/components/Menu.jsx`:

```jsx
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import './Menu.css';

function Menu() {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const { createRoom, joinRoom, error, clearError } = useGame();

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      createRoom(playerName.trim());
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (playerName.trim() && roomId.trim()) {
      joinRoom(roomId.trim(), playerName.trim());
    }
  };

  return (
    <div className="menu-container">
      <div className="menu-card">
        <h1 className="title">Guess the Number</h1>
        <p className="subtitle">Multiplayer Game - Avoid the Secret Number!</p>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={clearError} className="close-error">×</button>
          </div>
        )}

        <div className="input-section">
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input-field"
            maxLength={20}
          />
        </div>

        <div className="actions">
          <button
            onClick={handleCreateRoom}
            disabled={!playerName.trim()}
            className="btn btn-primary"
          >
            Create Room
          </button>

          <div className="divider">OR</div>

          <div className="join-section">
            <input
              type="text"
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="input-field"
              maxLength={4}
            />
            <button
              onClick={handleJoinRoom}
              disabled={!playerName.trim() || !roomId.trim()}
              className="btn btn-secondary"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Menu;
```

Create the lobby component `src/components/Lobby.jsx`:

```jsx
import React from 'react';
import { useGame } from '../context/GameContext';
import './Lobby.css';

function Lobby() {
  const {
    gameRoom,
    playerName,
    startGame,
    quitGame,
    countdown,
    isCountingDown
  } = useGame();

  if (!gameRoom) return null;

  const isHost = gameRoom.players.find(p => p.name === playerName)?.isHost;
  const canStart = gameRoom.players.length >= 2;

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <div className="room-header">
          <h2>Room: {gameRoom.roomId}</h2>
          <button onClick={quitGame} className="btn-quit">Leave</button>
        </div>

        {isCountingDown && (
          <div className="countdown-overlay">
            <div className="countdown-number">{countdown}</div>
            <div className="countdown-text">Game Starting...</div>
          </div>
        )}

        <div className="players-section">
          <h3>Players ({gameRoom.players.length})</h3>
          <div className="players-list">
            {gameRoom.players.map((player) => (
              <div key={player.id} className="player-item">
                <span className="player-name">
                  {player.name}
                  {player.isHost && <span className="host-badge">HOST</span>}
                  {player.name === playerName && <span className="you-badge">YOU</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <div className="host-controls">
            <button
              onClick={startGame}
              disabled={!canStart || isCountingDown}
              className="btn btn-primary btn-large"
            >
              {canStart ? 'Start Game' : 'Waiting for players...'}
            </button>
            {!canStart && (
              <p className="hint">Need at least 2 players to start</p>
            )}
          </div>
        )}

        {!isHost && (
          <div className="waiting-message">
            <p>Waiting for host to start the game...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Lobby;
```

Create the game play component `src/components/GamePlay.jsx`:

```jsx
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import './GamePlay.css';

function GamePlay() {
  const { gameRoom, playerName, makeGuess, quitGame, gameHistory } = useGame();
  const [guess, setGuess] = useState('');

  if (!gameRoom) return null;

  const currentPlayer = gameRoom.players[gameRoom.currentPlayerIndex];
  const isMyTurn = currentPlayer?.name === playerName;
  const myPlayerInfo = gameRoom.players.find(p => p.name === playerName);

  const handleGuess = (e) => {
    e.preventDefault();
    const guessNum = parseInt(guess);

    if (!isNaN(guessNum) && guessNum >= gameRoom.minRange && guessNum <= gameRoom.maxRange) {
      makeGuess(guessNum);
      setGuess('');
    }
  };

  return (
    <div className="gameplay-container">
      <div className="game-header">
        <div className="room-info">Room: {gameRoom.roomId}</div>
        <button onClick={quitGame} className="btn-quit-small">Leave</button>
      </div>

      <div className="game-content">
        {/* Range Display */}
        <div className="range-display">
          <div className="range-box">
            <div className="range-label">Range</div>
            <div className="range-value">
              {gameRoom.minRange} - {gameRoom.maxRange}
            </div>
          </div>
        </div>

        {/* Current Turn */}
        <div className="turn-info">
          {isMyTurn ? (
            <div className="your-turn">
              <h3>YOUR TURN!</h3>
              <p>Pick a number (but don't guess the secret number!)</p>
            </div>
          ) : (
            <div className="waiting-turn">
              <h3>Waiting for {currentPlayer?.name}...</h3>
              <p>It's their turn to guess</p>
            </div>
          )}
        </div>

        {/* Guess Input */}
        {isMyTurn && (
          <form onSubmit={handleGuess} className="guess-form">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder={`${gameRoom.minRange} - ${gameRoom.maxRange}`}
              min={gameRoom.minRange}
              max={gameRoom.maxRange}
              className="guess-input"
              autoFocus
            />
            <button
              type="submit"
              disabled={!guess}
              className="btn btn-guess"
            >
              Submit Guess
            </button>
          </form>
        )}

        {/* Players Status */}
        <div className="players-status">
          <h4>Players</h4>
          <div className="players-grid">
            {gameRoom.players.map((player, index) => (
              <div
                key={player.id}
                className={`player-card ${index === gameRoom.currentPlayerIndex ? 'active' : ''}`}
              >
                <div className="player-card-name">
                  {player.name}
                  {player.name === playerName && ' (You)'}
                </div>
                {index === gameRoom.currentPlayerIndex && (
                  <div className="turn-indicator">•</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Game History */}
        <div className="history-section">
          <h4>Game History</h4>
          <div className="history-list">
            {gameHistory.length === 0 ? (
              <p className="no-history">No guesses yet</p>
            ) : (
              gameHistory.slice().reverse().map((turn, index) => (
                <div key={index} className="history-item">
                  <span className="history-player">{turn.playerName}</span>
                  <span className="history-guess">guessed {turn.guess}</span>
                  <span className="history-result">{turn.result}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePlay;
```

Create the game finished component `src/components/GameFinished.jsx`:

```jsx
import React from 'react';
import { useGame } from '../context/GameContext';
import './GameFinished.css';

function GameFinished() {
  const { gameRoom, playerName, restartGame, quitGame, gameHistory } = useGame();

  if (!gameRoom) return null;

  const isHost = gameRoom.players.find(p => p.name === playerName)?.isHost;
  const lastTurn = gameHistory[gameHistory.length - 1];
  const loser = gameRoom.players.find(p => p.id === lastTurn?.playerId);

  return (
    <div className="finished-container">
      <div className="finished-card">
        <div className="game-over-header">
          <h1>Game Over!</h1>
        </div>

        <div className="result-section">
          <div className="loser-announcement">
            <h2>{loser?.name} LOSES!</h2>
            <p>They guessed the secret number: <strong>{lastTurn?.guess}</strong></p>
          </div>

          <div className="winners-section">
            <h3>Winners 🎉</h3>
            <div className="winners-list">
              {gameRoom.players
                .filter(p => p.id !== loser?.id)
                .map(player => (
                  <div key={player.id} className="winner-item">
                    {player.name}
                    {player.name === playerName && ' (You!)'}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="game-summary">
          <h4>Game Summary</h4>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total Guesses:</span>
              <span className="stat-value">{gameHistory.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Players:</span>
              <span className="stat-value">{gameRoom.players.length}</span>
            </div>
          </div>
        </div>

        <div className="finished-actions">
          {isHost ? (
            <>
              <button onClick={restartGame} className="btn btn-primary btn-large">
                Play Again
              </button>
              <button onClick={quitGame} className="btn btn-secondary">
                Leave Room
              </button>
            </>
          ) : (
            <>
              <p className="waiting-text">Waiting for host to restart...</p>
              <button onClick={quitGame} className="btn btn-secondary">
                Leave Room
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameFinished;
```

Create the main App component `src/App.jsx`:

```jsx
import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Menu from './components/Menu';
import Lobby from './components/Lobby';
import GamePlay from './components/GamePlay';
import GameFinished from './components/GameFinished';
import './App.css';

function GameRouter() {
  const { gameState, connected } = useGame();

  if (!connected) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Connecting to server...</p>
      </div>
    );
  }

  switch (gameState) {
    case 'LOBBY':
      return <Lobby />;
    case 'PLAYING':
      return <GamePlay />;
    case 'FINISHED':
      return <GameFinished />;
    case 'MENU':
    default:
      return <Menu />;
  }
}

function App() {
  return (
    <GameProvider>
      <div className="app">
        <GameRouter />
      </div>
    </GameProvider>
  );
}

export default App;
```

### Step 5: Styling

Create basic styling in `src/App.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* Common Styles */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-secondary {
  background: #2196F3;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #0b7dda;
  transform: translateY(-2px);
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
}

/* Loading Screen */
.loading-screen {
  text-align: center;
  color: white;
}

.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  background: #f44336;
  color: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-error {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
}
```

This provides a complete frontend implementation with:
- **Menu screen** for creating/joining rooms
- **Lobby** for waiting and starting games
- **Gameplay** interface with turn management
- **Game finished** screen with results
- **Responsive styling** and animations

## Key Learning Points

### 1. WebSocket vs HTTP
- **HTTP**: Request → Response (stateless, one-time)
- **WebSocket**: Persistent connection (stateful, real-time)

### 2. STOMP Message Types
- **Topics**: Broadcast to multiple subscribers (`/topic/room.{id}`)
- **Queues**: Point-to-point messaging (`/queue/user.{id}`)
- **Application**: Client-to-server commands (`/app/createRoom`)

### 3. Real-time Game State Management
- Server maintains authoritative game state
- Clients receive updates via WebSocket messages
- UI updates reactively based on incoming messages

### 4. Error Handling Strategies
- Connection timeouts and retries
- Message validation on both client and server
- Graceful degradation when WebSocket fails

### 5. Scalability Considerations
- Use external message brokers (RabbitMQ, Redis) for production
- Session management across multiple server instances
- Load balancing WebSocket connections

## Next Steps

1. **Add Authentication**: Implement user authentication and authorization
2. **Persistence**: Add database to store game history and player stats
3. **Advanced Features**: Spectator mode, private rooms, custom game rules
4. **Mobile Support**: Create React Native or mobile web version
5. **Deployment**: Deploy to cloud with proper WebSocket support
6. **Monitoring**: Add logging and monitoring for WebSocket connections

This tutorial provides a solid foundation for building real-time multiplayer games using WebSocket technology. The combination of Spring Boot's WebSocket support and React's reactive state management creates a smooth, responsive gaming experience.