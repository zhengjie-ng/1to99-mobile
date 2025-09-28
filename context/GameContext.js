import { createContext, useContext, useReducer, useEffect } from "react";
import WebSocketService from "../services/WebSocketService";

const GameContext = createContext();

const initialState = {
  connected: false,
  playerName: "",
  gameRoom: null,
  gameHistory: [],
  currentTurn: null,
  error: null,
  gameState: "MENU", // MENU, LOBBY, PLAYING, FINISHED, CAMERA
  countdown: 0,
  isCountingDown: false,
  shouldShowJoinMode: false,
};

function gameReducer(state, action) {
  console.log("GameReducer - Action:", action.type, action.payload);
  console.log("GameReducer - Current state:", state.gameState);

  switch (action.type) {
    case "SET_CONNECTED":
      return { ...state, connected: action.payload };

    case "SET_PLAYER_NAME":
      return { ...state, playerName: action.payload };

    case "SET_GAME_ROOM":
      return { ...state, gameRoom: action.payload };

    case "SET_GAME_STATE":
      console.log(
        "GameReducer - Setting game state from",
        state.gameState,
        "to",
        action.payload
      );
      return { ...state, gameState: action.payload };

    case "ADD_GAME_TURN":
      return {
        ...state,
        gameHistory: [...state.gameHistory, action.payload],
        currentTurn: action.payload,
      };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "START_COUNTDOWN":
      return {
        ...state,
        countdown: action.payload,
        isCountingDown: true,
      };

    case "UPDATE_COUNTDOWN":
      return {
        ...state,
        countdown: action.payload,
      };

    case "END_COUNTDOWN":
      return {
        ...state,
        countdown: 0,
        isCountingDown: false,
      };

    case "CLEAR_GAME_HISTORY":
      return {
        ...state,
        gameHistory: [],
        currentTurn: null,
      };

    case "SET_SHOULD_SHOW_JOIN_MODE":
      return { ...state, shouldShowJoinMode: action.payload };

    case "RESET_GAME":
      return {
        ...initialState,
        connected: state.connected,
        playerName: state.playerName,
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
      dispatch({ type: "SET_CONNECTED", payload: true });

      // Subscribe to personal queue for game updates (keeping for compatibility)
      WebSocketService.subscribe("/user/queue/gameUpdate", handleGameUpdate);
      console.log("Subscribed to /user/queue/gameUpdate");

      // Subscribe to general game response topic for room creation responses
      WebSocketService.subscribe("/topic/gameResponse", handleGameUpdate);
      console.log("Subscribed to /topic/gameResponse");
    } catch (error) {
      console.log(error);
      dispatch({ type: "SET_ERROR", payload: "Failed to connect to server" });
    }
  };

  const handleGameUpdate = (message) => {
    console.log("Game update:", message);

    switch (message.type) {
      case "ROOM_CREATED":
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        dispatch({ type: "SET_GAME_STATE", payload: "LOBBY" });
        subscribeToRoom(message.gameRoom.roomId);
        // Subscribe to personal topic using host ID
        subscribeToUserTopic(message.gameRoom.hostId);
        break;

      case "PLAYER_JOINED":
        console.log("Processing PLAYER_JOINED message:", message);
        console.log("Current game state:", state.gameState);
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        // Set to lobby state for any player who receives this message and isn't already in a game
        if (
          message.gameRoom &&
          (state.gameState === "MENU" ||
            state.gameState === "CAMERA" ||
            !state.gameRoom)
        ) {
          console.log("Setting game state to LOBBY");
          dispatch({ type: "SET_GAME_STATE", payload: "LOBBY" });
          // Subscribe to personal topic for the joining player
          const joinedPlayer = message.gameRoom.players.find(
            (p) => p.name === state.playerName
          );
          if (joinedPlayer) {
            subscribeToUserTopic(joinedPlayer.id);
          }
        }
        break;

      case "ROOM_JOINED":
        console.log("Processing ROOM_JOINED message:", message);
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        dispatch({ type: "SET_GAME_STATE", payload: "LOBBY" });
        // Subscribe to personal topic for the player who just joined
        const currentPlayer = message.gameRoom.players.find(
          (p) => p.name === state.playerName
        );
        if (currentPlayer) {
          subscribeToUserTopic(currentPlayer.id);
        }
        break;

      case "GAME_STARTING_COUNTDOWN":
        console.log("Game starting countdown...");
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        startCountdown();
        break;

      case "GAME_STARTED":
        console.log(
          "🎯 SECRET NUMBER FOR TESTING:",
          message.gameRoom.secretNumber
        );
        dispatch({ type: "END_COUNTDOWN" });
        dispatch({ type: "CLEAR_GAME_HISTORY" });
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        dispatch({ type: "SET_GAME_STATE", payload: "PLAYING" });
        break;

      case "GUESS_MADE":
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        dispatch({ type: "ADD_GAME_TURN", payload: message.lastTurn });

        if (message.gameRoom.state === "FINISHED") {
          dispatch({ type: "SET_GAME_STATE", payload: "FINISHED" });
        } else {
          // Check if range is narrowed to single number and auto-guess for current player
          const { minRange, maxRange } = message.gameRoom;
          if (minRange === maxRange) {
            // Auto-guess the only remaining number after a short delay
            setTimeout(() => {
              makeGuessInternal(message.gameRoom.roomId, minRange);
            }, 3000);
          }
        }
        break;

      case "PLAYER_QUIT":
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        break;

      case "GAME_RESTARTED":
        console.log("Game restarted, returning to lobby:", message);
        dispatch({ type: "CLEAR_GAME_HISTORY" });
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        dispatch({ type: "SET_GAME_STATE", payload: "LOBBY" });
        break;

      case "PLAYER_KICKED":
        console.log("You have been removed from the game by the host");
        // Unsubscribe from room topic since player is no longer part of the game
        if (state.gameRoom) {
          WebSocketService.unsubscribe(`/topic/room.${state.gameRoom.roomId}`);
          console.log(
            `Unsubscribed from room topic: /topic/room.${state.gameRoom.roomId}`
          );

          // Also unsubscribe from personal topic
          const currentPlayer = state.gameRoom.players?.find(
            (p) => p.name === state.playerName
          );
          if (currentPlayer) {
            WebSocketService.unsubscribe(`/topic/user.${currentPlayer.id}`);
            console.log(
              `Unsubscribed from user topic: /topic/user.${currentPlayer.id}`
            );
          }
        }
        // Show error message and return to main menu
        dispatch({ type: "SET_ERROR", payload: message.message });
        dispatch({ type: "RESET_GAME" });
        break;

      case "PLAYER_REMOVED":
        console.log("Player removed by host:", message);
        // Another player was removed - just update the room
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        break;

      case "ERROR":
        console.log("Received ERROR message:", message.message);
        dispatch({ type: "SET_ERROR", payload: message.message });
        break;

      default:
        console.log("Unknown message type:", message.type);
    }
  };

  const subscribeToRoom = (roomId) => {
    console.log("Subscribing to room topic:", `/topic/room.${roomId}`);
    WebSocketService.subscribe(`/topic/room.${roomId}`, (message) => {
      console.log(`Received message on /topic/room.${roomId}:`, message);
      handleGameUpdate(message);
    });
  };

  const subscribeToUserTopic = (playerId) => {
    console.log("Subscribing to user topic:", `/topic/user.${playerId}`);
    WebSocketService.subscribe(`/topic/user.${playerId}`, (message) => {
      console.log(`Received message on /topic/user.${playerId}:`, message);
      handleGameUpdate(message);
    });
  };

  const startCountdown = () => {
    let count = 5;
    dispatch({ type: "START_COUNTDOWN", payload: count });

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        dispatch({ type: "UPDATE_COUNTDOWN", payload: count });
      } else {
        dispatch({ type: "END_COUNTDOWN" });
        clearInterval(interval);
      }
    }, 1000);
  };

  const createRoom = (playerName) => {
    console.log("Creating room for player:", playerName);
    dispatch({ type: "SET_PLAYER_NAME", payload: playerName });

    // Check if WebSocket is connected before sending
    if (!state.connected) {
      dispatch({
        type: "SET_ERROR",
        payload: "Not connected to server. Please wait and try again.",
      });
      return;
    }

    try {
      // Generate a temporary player ID for subscription purposes
      const tempPlayerId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Subscribe to user-specific topic to receive ROOM_CREATED response
      console.log(
        "Subscribing to user-specific topic:",
        `/topic/user.${tempPlayerId}`
      );
      WebSocketService.subscribe(`/topic/user.${tempPlayerId}`, (message) => {
        console.log(`Received message on user topic:`, message);
        handleGameUpdate(message);
      });

      WebSocketService.send("/app/createRoom", { playerName, tempPlayerId });
      console.log("Sent createRoom message with tempPlayerId:", tempPlayerId);
    } catch (error) {
      console.error("Failed to send createRoom message:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to create room: " + error.message,
      });
    }
  };

  const joinRoom = (roomId, playerName) => {
    console.log("Joining room:", roomId, "with player:", playerName);
    dispatch({ type: "SET_PLAYER_NAME", payload: playerName });

    // Check if WebSocket is connected before sending
    if (!state.connected) {
      dispatch({
        type: "SET_ERROR",
        payload: "Not connected to server. Please wait and try again.",
      });
      return;
    }

    try {
      // Subscribe to room topic BEFORE sending join request to avoid race condition
      subscribeToRoom(roomId);

      WebSocketService.send("/app/joinRoom", { roomId, playerName });
      console.log("Sent joinRoom message");

      // Set a timeout to handle case where no response comes back
      setTimeout(() => {
        if (state.gameState === "MENU" && !state.gameRoom) {
          dispatch({
            type: "SET_ERROR",
            payload: "Room not found - Please enter an existing Room ID",
          });
        }
      }, 3000);
    } catch (error) {
      console.error("Failed to send joinRoom message:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to join room: " + error.message,
      });
    }
  };

  const startGame = () => {
    if (state.gameRoom) {
      // Use the new backend endpoint that handles countdown and broadcasts to all players
      WebSocketService.send("/app/startGameCountdown", {
        roomId: state.gameRoom.roomId,
      });
      // console.log("Sent startGameCountdown message");
    }
  };

  const makeGuessInternal = (roomId, guess) => {
    WebSocketService.send("/app/makeGuess", {
      roomId: roomId,
      guess: parseInt(guess),
    });
  };

  const makeGuess = (guess) => {
    if (state.gameRoom) {
      makeGuessInternal(state.gameRoom.roomId, guess);
    }
  };

  const quitGame = () => {
    if (state.gameRoom) {
      // Send quit decision to server to remove player from room
      WebSocketService.send("/app/quitGame", {
        roomId: state.gameRoom.roomId,
        playerName: state.playerName,
      });
      console.log("Sent quitGame message for player:", state.playerName);

      // Unsubscribe from room topic
      WebSocketService.unsubscribe(`/topic/room.${state.gameRoom.roomId}`);
      console.log(
        `Unsubscribed from room topic: /topic/room.${state.gameRoom.roomId}`
      );

      // Also unsubscribe from personal topic if we have player info
      const currentPlayer = state.gameRoom.players?.find(
        (p) => p.name === state.playerName
      );
      if (currentPlayer) {
        WebSocketService.unsubscribe(`/topic/user.${currentPlayer.id}`);
        console.log(
          `Unsubscribed from user topic: /topic/user.${currentPlayer.id}`
        );
      }
    }
    // Reset local state immediately
    dispatch({ type: "RESET_GAME" });
  };

  const restartGame = () => {
    if (state.gameRoom) {
      WebSocketService.send("/app/restartGame", {
        roomId: state.gameRoom.roomId,
      });
      console.log("Sent restartGame message for room:", state.gameRoom.roomId);
    }
  };

  const removePlayer = (playerName) => {
    if (state.gameRoom) {
      WebSocketService.send("/app/removePlayer", {
        roomId: state.gameRoom.roomId,
        playerName: playerName,
      });
      console.log("Sent removePlayer message for player:", playerName);
    }
  };

  const backFromCameraToJoin = () => {
    dispatch({ type: "SET_SHOULD_SHOW_JOIN_MODE", payload: true });
    dispatch({ type: "SET_GAME_STATE", payload: "MENU" });
  };

  const clearJoinModeFlag = () => {
    dispatch({ type: "SET_SHOULD_SHOW_JOIN_MODE", payload: false });
  };

  const setPlayerName = (name) => {
    dispatch({ type: "SET_PLAYER_NAME", payload: name });
  };

  const value = {
    ...state,
    createRoom,
    joinRoom,
    startGame,
    makeGuess,
    quitGame,
    restartGame,
    removePlayer,
    setPlayerName,
    backToLobby: () => dispatch({ type: "SET_GAME_STATE", payload: "LOBBY" }),
    goToCamera: () => dispatch({ type: "SET_GAME_STATE", payload: "CAMERA" }),
    backToMenu: () => dispatch({ type: "SET_GAME_STATE", payload: "MENU" }),
    backFromCameraToJoin,
    clearJoinModeFlag,
    clearError: () => dispatch({ type: "CLEAR_ERROR" }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
