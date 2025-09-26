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
import { GameProvider } from "./context/GameContext";
import soundService from "./services/SoundService";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Poppins_400Regular } from "@expo-google-fonts/poppins";
import { DaysOne_400Regular } from "@expo-google-fonts/days-one";
import { Colors } from "./styles/colors";
import GameApp from "./screens/GameApp";
import Countdown from "./screens/Countdown";

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    DaysOne_400Regular,
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sound = useRef(null);

  useEffect(() => {
    if (fontsLoaded) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded]);

  // Setup background music
  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Set audio mode for background playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Load and play background music
        const { sound: bgmSound } = await Audio.Sound.createAsync(
          require("./sounds/bgm.mp3"),
          {
            isLooping: true,
            volume: 0.3, // Set volume to 30% (not too loud)
            shouldPlay: true, // Auto-play when loaded
          }
        );

        sound.current = bgmSound;

        // Ensure it's playing
        const status = await bgmSound.getStatusAsync();
        if (!status.isPlaying) {
          await bgmSound.playAsync();
        }
      } catch (error) {
        console.log("Error loading background music:", error);
      }
    };

    setupAudio();

    // Cleanup function
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
      soundService.cleanup();
    };
  }, []);

  if (!fontsLoaded)
    return <ActivityIndicator size="large" color={Colors.PRIMARY} />;

  return (
    <GameProvider>
      <View style={{ flex: 1 }}>
        <Animated.View style={[styles.imageBackground, { opacity: fadeAnim }]}>
          <ImageBackground
            source={require("./assets/images/pattern.jpg")}
            style={styles.imageBackgroundContainer}
            imageStyle={styles.imageStyle}
            resizeMode="repeat"
          />
        </Animated.View>
        <SafeAreaProvider style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
              style={styles.keyboardAvoidingView}
              behavior="padding"
            >
              <View style={styles.gameContainer}>
                <GameApp />
                <StatusBar style="auto" />
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
        <Countdown />
      </View>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    // paddingBottom: 60,
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
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  gameContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    // paddingBottom: 60,
  },
});
