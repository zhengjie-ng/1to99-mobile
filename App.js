import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { GameProvider, useGame } from "./context/GameContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Poppins_400Regular } from "@expo-google-fonts/poppins";
import { DaysOne_400Regular } from "@expo-google-fonts/days-one";
import { Colors } from "./styles/colors";
import Countdown from "./screens/Countdown";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import StackNavigator from "./navigation/StackNavigator";
import Sounds from "./utilities/sounds";

function NavigationHandler() {
  const navigation = useNavigation();
  const { gameState } = useGame();

  useEffect(() => {
    if (!navigation || !gameState) return;

    try {
      switch (gameState) {
        case "MENU":
          navigation.navigate("MENU");
          break;
        case "LOBBY":
          navigation.navigate("LOBBY");
          break;
        case "PLAYING":
          navigation.navigate("PLAYING");
          break;
        case "FINISHED":
          navigation.navigate("FINISHED");
          break;
        case "CAMERA":
          navigation.navigate("CAMERA");
          break;
        default:
          break;
      }
    } catch (error) {
      console.log("Navigation error:", error);
    }
  }, [gameState, navigation]);

  return null;
}

Sounds.playBgm();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    DaysOne_400Regular,
  });

  if (!fontsLoaded)
    return <ActivityIndicator size="large" color={Colors.PRIMARY} />;

  return (
    <GameProvider>
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: "transparent" }}>
          <SafeAreaProvider>
            <StackNavigator />
            <NavigationHandler />
            <StatusBar style="auto" />
          </SafeAreaProvider>
          <Countdown />
        </View>
      </NavigationContainer>
    </GameProvider>
  );
}
