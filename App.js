import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  ActivityIndicator,
  ImageBackground,
  Animated,
} from "react-native";
import { useRef, useEffect } from "react";
import { Audio } from "expo-av";
import { GameProvider, useGame } from "./context/GameContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fontsLoaded) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded)
    return <ActivityIndicator size="large" color={Colors.PRIMARY} />;

  return (
    <GameProvider>
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: "transparent" }}>
          {/* <Animated.View
            style={[styles.imageBackground, { opacity: fadeAnim }]}
          >
            <ImageBackground
              source={require("./assets/images/pattern.jpg")}
              style={styles.imageBackgroundContainer}
              imageStyle={styles.imageStyle}
              resizeMode="repeat"
            />
          </Animated.View> */}
          <SafeAreaProvider style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
              <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior="padding"
              >
                <View style={styles.gameContainer}>
                  <StackNavigator />
                  <NavigationHandler />
                  <StatusBar style="auto" />
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </SafeAreaProvider>
          <Countdown />
        </View>
      </NavigationContainer>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "stretch",
    justifyContent: "center",
  },
  imageBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  imageBackgroundContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageStyle: {
    opacity: 0.1,
  },
  safeArea: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    width: "100%",
  },
  gameContainer: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    width: "100%",
  },
});
