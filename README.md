# 1to99 Mobile

A real-time multiplayer number guessing game mobile application built with React Native and Expo.

## 🎮 Game Description

1to99 is a competitive multiplayer guessing game where players take turns trying to avoid guessing a secret number between 1 and 99. The game provides feedback to narrow down the range with each guess. The objective is to force other players to guess the secret number - whoever guesses the exact secret number loses the game! This mobile app provides an intuitive interface for creating rooms, joining games, and playing with friends in real-time.

## 🔧 Technologies Used

### Core React Native Expo Stack

- **React Native 0.81.4** - Cross-platform mobile development framework that allows building native mobile apps using React

  - Enables code sharing between iOS and Android platforms
  - Provides native performance with JavaScript development experience
  - Access to platform-specific APIs and native modules

- **Expo ~54.0.9** - Comprehensive development platform and toolchain for React Native

  - **Expo CLI**: Command-line tools for development, building, and deployment
  - **Expo SDK**: Pre-built native modules and APIs (camera, audio, storage, etc.)
  - **Expo Go**: Development client for testing on real devices
  - **EAS Build**: Cloud build service for production apps
  - **Over-the-Air Updates**: Push updates without app store submissions
  - **Simplified Development**: No need for Xcode/Android Studio setup

- **React 19.1.0** - JavaScript library for building user interfaces
  - Component-based architecture for reusable UI elements
  - State management with hooks (useState, useEffect, useContext)
  - Virtual DOM for efficient rendering

### Navigation & State Management

- **@react-navigation/native 7.1.17** - Navigation library for screen management
  - Stack navigation for hierarchical screen transitions
  - Automatic deep linking and URL handling
  - Native navigation animations and gestures
  - Type-safe navigation with TypeScript support

### Real-time Communication

- **@stomp/stompjs 7.2.0** - STOMP protocol client for WebSocket communication

  - Simple Text Oriented Message Protocol over WebSockets
  - Message broker integration for pub/sub messaging
  - Automatic reconnection and heartbeat management
  - Support for message acknowledgment and transactions

- **sockjs-client 1.6.1** - WebSocket client library with fallback support
  - SockJS protocol for WebSocket emulation
  - Automatic fallback to polling when WebSocket unavailable
  - Cross-browser compatibility and transport protocol selection
  - Seamless integration with STOMP for reliable messaging

### Device Integration & Features

- **@react-native-async-storage/async-storage 2.2.0** - Persistent local storage

  - **Key Features:**
    - Asynchronous, persistent key-value storage system
    - Data persists across app launches and device reboots
    - Support for storing strings, objects (JSON serialized), and binary data
    - Automatic encryption on iOS (Keychain) and Android (SharedPreferences)
  - **Use Cases in App:**
    - Storing player names for auto input
  - **Learning Benefits:**
    - Understanding mobile data persistence patterns
    - Working with async/await patterns in React Native
    - Managing app state across sessions

- **expo-camera ~17.0.8** - Camera integration with built-in QR code scanning

  - **Key Features:**
    - Access to device front and rear cameras with `CameraView` component
    - Real-time camera preview with customizable UI overlays
    - Built-in barcode and QR code scanning via `onBarcodeScanned` prop
    - Photo and video capture capabilities
    - Camera permission handling with `useCameraPermissions` hook
    - Full-screen camera experience with overlay UI elements
  - **Implementation in App:**
    - `CameraView` component for full-screen QR scanning experience
    - `handleBarCodeScanned` function processes scanned room IDs
    - Permission management with user-friendly fallback UI
    - Scan validation to ensure only valid room IDs are accepted
    - Prevents duplicate scans with state management and refs
  - **Learning Benefits:**
    - Understanding device permission workflows and UX patterns
    - Working with native device hardware APIs through React Native
    - Implementing computer vision features in mobile apps
    - Handling camera lifecycle, memory management, and scan state
    - Creating intuitive camera UI with overlays and controls

- **expo-audio ~1.0.13** - Audio playback for game sounds
  - **Key Features:**
    - Play local and remote audio files
    - Support for multiple audio formats (MP3, WAV, AAC, M4A)
    - Background audio playback capabilities
    - Audio session management and mixing
    - Volume control and playback rate adjustment
  - **Use Cases in App:**
    - Background music during gameplay
    - Sound effects for game events (join, guess, win/lose)
    - Audio feedback for user interactions
    - Ambient sounds for enhanced gaming experience
  - **Learning Benefits:**
    - Understanding mobile audio management
    - Working with media assets in React Native
    - Implementing responsive audio feedback systems
    - Managing audio resources and memory

### UI & Animation

- **react-native-reanimated ~4.1.1** - High-performance animation library

  - Native-driven animations for 60fps performance
  - Gesture handling and interaction animations
  - Shared element transitions between screens
  - Complex animation sequences and timing functions

- **react-native-gesture-handler ~2.28.0** - Native touch gesture system
  - Platform-optimized gesture recognition
  - Multi-touch and complex gesture support
  - Integration with animation library for smooth interactions

### Design & Typography

- **Expo Google Fonts** - Custom typography integration
  - **@expo-google-fonts/poppins** - Modern, clean sans-serif font (Poppins_400Regular)
  - **@expo-google-fonts/days-one** - Bold, gaming-style display font (DaysOne_400Regular)
  - Automatic font loading and caching with `useFonts` hook
  - Fallback font handling for loading states with ActivityIndicator

### Additional Development Tools

- **expo-constants 18.0.9** - Access to system and app constants
- **react-native-safe-area-context 5.6.0** - Safe area handling for modern devices
- **react-native-shadow-2 7.1.2** - Advanced shadow effects for UI elements
- **react-native-svg 15.13.0** - Scalable vector graphics support (required by react-qr-code)
- **react-qr-code 2.0.18** - QR code generation for room sharing

## Learning Benefits of This Stack

### For React Native Development:

- **Cross-platform Skills**: Learn once, deploy to both iOS and Android
- **Modern JavaScript/React**: Advanced React patterns with hooks and context
- **Native Integration**: Understanding how to bridge JavaScript and native code
- **Performance Optimization**: Native animations and efficient rendering techniques

### For Mobile Development:

- **Device APIs**: Camera, storage and audio implementation
- **Platform Guidelines**: iOS and Android design pattern implementation
- **App Lifecycle**: Managing background states, permissions, and memory
- **Real-world Features**: QR scanning, persistent storage, audio playback

### For Real-time Applications:

- **WebSocket Communication**: Bidirectional real-time messaging
- **State Synchronization**: Keeping multiple clients in sync
- **Connection Management**: Handling network issues and reconnection
- **Message Patterns**: Pub/sub, request/response, and broadcast messaging

## 📡 WebSocket Implementation

### What is WebSocket?

WebSocket is a communication protocol that provides full-duplex communication channels over a single TCP connection. Unlike traditional HTTP request-response patterns, WebSockets allow both the client and server to send data at any time, making them perfect for real-time applications like games, chat systems, and live updates.

### How This Project Uses WebSockets

This mobile frontend communicates with the backend using **STOMP (Simple Text Oriented Messaging Protocol)** over WebSockets:

#### 1. WebSocket Service (`services/WebSocketService.js`)

The app uses a centralized WebSocket service that handles:

```javascript
// Connection establishment with SockJS fallback
this.client = new Client({
  webSocketFactory: () => new SockJS(this.wsUrl),
  reconnectDelay: 5000,
  heartbeatIncoming: 10000,
  heartbeatOutgoing: 10000,
  // Connection handlers...
});
```

**Key Features:**

- **SockJS Transport**: Provides WebSocket with fallback support for older browsers/environments
- **Auto-reconnection**: Automatically reconnects if connection is lost
- **Heartbeat**: Maintains connection health with ping/pong messages
- **Subscription Management**: Tracks and manages topic subscriptions

#### 2. Game Context Integration (`context/GameContext.js`)

The WebSocket service is integrated into React's Context API for state management:

```javascript
// Connection setup
await WebSocketService.connect();
WebSocketService.subscribe("/user/queue/gameUpdate", handleGameUpdate);
WebSocketService.subscribe("/topic/gameResponse", handleGameUpdate);
```

**Message Handling:**

- **Room Creation**: Subscribes to user-specific topics for room creation responses
- **Game Updates**: Receives real-time game state changes
- **Player Actions**: Handles join/leave notifications
- **Error Handling**: Manages connection errors and game exceptions

#### 3. Frontend-Backend Communication Flow

**Connection Process:**

1. App launches → WebSocket service connects to backend `/ws` endpoint
2. Service subscribes to general topics for initial communication
3. User actions trigger specific subscriptions (room topics, user topics)

**Message Exchange Examples:**

**Creating a Room:**

```javascript
// Frontend sends
WebSocketService.send("/app/createRoom", {
  playerName: "Player1",
  tempPlayerId: "temp_12345",
});

// Backend responds via: /topic/user.temp_12345
// Frontend receives: { type: "ROOM_CREATED", gameRoom: {...} }
```

**Making a Guess:**

```javascript
// Frontend sends
WebSocketService.send("/app/makeGuess", {
  roomId: "ROOM123",
  guess: 50,
});

// Backend broadcasts to: /topic/room.ROOM123
// All players receive: { type: "GUESS_MADE", lastTurn: {...} }
```

#### 4. Real-time Features Enabled by WebSockets

- **Instant Game Updates**: All players see moves immediately
- **Live Player Management**: Real-time join/leave notifications
- **Synchronized Game State**: Countdown timers, turn indicators, range updates
- **Host Controls**: Real-time player removal and game restart
- **Connection Status**: Live connection health indicators

### Message Topics Structure

The app subscribes to different WebSocket topics based on context:

- **`/topic/room.{roomId}`** - Room-specific updates (all players)
- **`/topic/user.{playerId}`** - Personal messages (individual player)
- **`/user/queue/gameUpdate`** - Personal queue for direct messages
- **`/topic/gameResponse`** - General game responses

This multi-topic approach ensures players receive relevant updates while maintaining efficient message routing.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation & Running

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd 1to99-mobile
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   EXPO_PUBLIC_WS_MODE=local
   EXPO_PUBLIC_WS_URL_LOCAL=http://localhost:8080
   EXPO_PUBLIC_WS_URL_NGROK=https://your-ngrok-url.ngrok.io
   ```

   **🌐 Quick Start with Live Backend**

   Want to test immediately without setting up your own backend? Use our hosted backend:

   ```env
   EXPO_PUBLIC_WS_MODE=local
   EXPO_PUBLIC_WS_URL_PRODUCTION=https://1to99-backend.zhengjie.app
   ```

4. **Start the development server**

   ```bash
   # Start Expo development server
   npm start

   # Or run on specific platform
   npm run android  # For Android
   npm run ios      # For iOS
   npm run web      # For web browser
   ```

5. **Connect to backend**

   Ensure the 1to99 backend server is running on `localhost:8080` or configure the appropriate WebSocket URL.

### Environment Configuration

The app supports different WebSocket connection modes:

- **Local Mode**: Connects to local backend (`localhost:8080`)
- **Ngrok Mode**: Connects to external backend via ngrok tunnel
- **Production Mode**: Connects to live hosted backend

### 🌐 Live Hosted Backend

**Don't want to set up your own backend?** You can use our hosted backend:

- **URL**: `https://1to99-backend.zhengjie.app/`
- **WebSocket**: `wss://1to99-backend.zhengjie.app/ws`
- **Infrastructure**: Synology NAS Container with Cloudflare Tunneling
- **Availability**: 24/7 for development and testing

**Benefits of using the live backend:**

- ✅ **No Setup Required** - Start developing immediately
- ✅ **Always Available** - No need to manage your own server
- ✅ **Real Multiplayer** - Test with friends across different devices
- ✅ **Latest Features** - Always running the most recent backend version
- ✅ **Learning Focus** - Concentrate on React Native development

Configure via environment variables in `.env` file.

## 🎯 App Features

### Core Game Features

- **Room Creation & Joining**: Create private game rooms or join existing ones
- **QR Code Integration**: Scan QR codes to quickly join rooms
- **Real-time Multiplayer**: Synchronized gameplay across all devices
- **Turn-based Guessing**: Visual turn indicators and guess validation
- **Range Display**: Clear visualization of remaining number range
- **Game History**: Track of all guesses made during the game

### User Experience Features

- **Persistent Player Names**: Automatically saves and restores player names
- **Audio Feedback**: Sound effects for game events (join, guess, finish)
- **Smooth Animations**: React Native Reanimated for fluid UI transitions
- **Responsive Design**: Optimized layouts for different screen sizes
- **Error Handling**: User-friendly error messages and recovery options

### Host Features

- **Player Management**: Remove disruptive players from games
- **Game Controls**: Start, restart, and manage game sessions
- **Room Settings**: Control game parameters and player limits

## 📱 Screen Navigation

The app uses React Navigation with the following screen structure:

```
📱 App Navigation
├── 🏠 MENU - Main menu (create/join room)
├── 📷 CAMERA - QR code scanner for joining rooms
├── 🎪 LOBBY - Waiting room before game starts
├── 🎮 PLAYING - Active gameplay screen
└── 🏆 FINISHED - Game results and restart options
```

Navigation is automatically managed based on WebSocket game state updates.

## 📁 Project Structure

```
├── components/           # Reusable UI components
│   ├── Background.js    # Background component
│   ├── Board.js         # Game board display
│   ├── Button.js        # Custom button component
│   └── Header.js        # App header
├── context/
│   └── GameContext.js   # Global game state management
├── navigation/
│   └── StackNavigator.js # Screen navigation setup
├── screens/             # App screens
│   ├── GamePlay.js      # Main gameplay screen
│   ├── GameLobby.js     # Pre-game lobby
│   ├── GameFinished.js  # Post-game results
│   └── Countdown.js     # Game start countdown
├── services/
│   └── WebSocketService.js # WebSocket communication layer
├── styles/              # Styling and theming
├── utilities/           # Helper functions and utilities
└── App.js              # Main app component
```

## 🔗 Related Projects

This mobile frontend works in conjunction with the **1to99 Backend** - a Spring Boot application that provides the WebSocket server and game logic.

## 🎨 Design Features

- **Custom Typography**: Google Fonts integration (Poppins, Days One)
- **Consistent Color Scheme**: Unified color palette across all screens
- **Responsive Layouts**: Adapts to different screen sizes and orientations
- **Smooth Animations**: Enhanced user experience with fluid transitions
- **Audio Integration**: Contextual sound effects for better engagement

## 🔧 Development Tools

- **ESLint**: Code linting with Expo configuration
- **Expo DevTools**: Hot reloading and debugging tools
- **React Native Debugger**: Advanced debugging capabilities
- **Expo Camera**: QR code scanning integration
- **AsyncStorage**: Persistent data storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**WebSocket Connection Failed:**

- Ensure backend server is running
- Check network connectivity
- Verify WebSocket URL configuration

**App Won't Start:**

- Clear Expo cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

**QR Code Scanner Not Working:**

- Grant camera permissions
- Ensure adequate lighting
- Try manual room ID entry as fallback
