import { Text, View } from "react-native";
import { useGame } from "../context/GameContext";
import MainMenu from "./MainMenu";
import GameLobby from "./GameLobby";
import GamePlay from "./GamePlay";
import GameFinished from "./GameFinished";
import CameraScreen from "./CameraScreen";

function GameApp() {
  const { gameState, connected, gameRoom, playerName, backFromCameraToJoin } =
    useGame();

  console.log("🎮 GameApp - Current gameState:", gameState);
  console.log("🎮 GameApp - Connected:", connected);
  console.log("🎮 GameApp - Has gameRoom:", !!gameRoom);
  console.log("🎮 GameApp - PlayerName:", playerName);

  if (!connected) {
    return <Text>Connecting to server...</Text>;
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
