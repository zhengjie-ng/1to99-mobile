import { View } from "react-native";
import { useGame } from "../context/GameContext";
import MainMenu from "./MainMenu";
import GameLobby from "./GameLobby";
import GamePlay from "./GamePlay";
import GameFinished from "./GameFinished";
import CameraScreen from "./CameraScreen";
import Header from "../components/Header";

function GameApp() {
  const { gameState, connected, gameRoom, playerName, backFromCameraToJoin } =
    useGame();

  console.log("🎮 GameApp - Current gameState:", gameState);
  console.log("🎮 GameApp - Connected:", connected);
  console.log("🎮 GameApp - Has gameRoom:", !!gameRoom);
  console.log("🎮 GameApp - PlayerName:", playerName);

  if (!connected) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Header style={{ fontSize: 20 }}>Connecting to server...</Header>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {gameState === "MENU" && <MainMenu />}
      {gameState === "LOBBY" && <GameLobby />}
      {gameState === "PLAYING" && <GamePlay />}
      {gameState === "FINISHED" && <GameFinished />}
      {gameState === "CAMERA" && (
        <CameraScreen onBack={backFromCameraToJoin} playerName={playerName} />
      )}
    </View>
  );
}

export default GameApp;
