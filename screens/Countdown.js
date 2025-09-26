import { View, Text, StyleSheet } from "react-native";
import { useGame } from "../context/GameContext";
import { Colors } from "../styles/colors";

function Countdown() {
  const { countdown, isCountingDown } = useGame();

  if (!isCountingDown) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text style={styles.title}>Game Starting!</Text>
        <Text style={styles.number}>{countdown}</Text>
        <Text style={styles.subtitle}>Get ready...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "DaysOne_400Regular",
    color: Colors.PRIMARY,
    marginBottom: 20,
    textAlign: "center",
  },
  number: {
    fontSize: 80,
    fontFamily: "DaysOne_400Regular",
    color: Colors.SECONDARY_DARK,
    marginVertical: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
    color: Colors.GRAY,
    marginTop: 20,
    textAlign: "center",
  },
});

export default Countdown;
