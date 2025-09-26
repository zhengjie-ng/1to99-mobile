import { Pressable, Text, StyleSheet } from "react-native";
import { Colors } from "../styles/colors";
import soundService from "../services/SoundService";

function Button({ children, onPress, style }) {
  const handlePress = (event) => {
    // Play click sound (don't await to avoid blocking UI)
    soundService.playClickSound();

    // Execute the original onPress function with the event parameter
    if (onPress) {
      onPress(event);
    }
  };
  return (
    <Pressable
      // style={styles.buttonContainer}
      style={({ pressed }) => [
        styles.buttonContainer,
        style,
        pressed && styles.buttonPressed,
      ]}
      // If you want to handle iOS/Android differently
      //   style={({ pressed }) => [
      //     styles.buttonContainer,
      //     pressed && Platform.OS === "ios" && styles.buttonPressed,
      //   ]}
      //   android_ripple={{ color: "#ffe15940", foreground: true }}
      onPress={handlePress}
    >
      <Text style={styles.buttonText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  buttonText: {
    fontFamily: "DaysOne_400Regular",
    color: "#fff",
    textTransform: "uppercase",
    fontSize: 18,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ translateY: 2 }],
  },
});

export default Button;
