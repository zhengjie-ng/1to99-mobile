import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { Colors } from "../styles/colors";
import Button from "../components/Button";
import Header from "../components/Header";

function MainMenu() {
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    playerName,
    createRoom,
    joinRoom,
    error,
    clearError,
    goToCamera,
    shouldShowJoinMode,
    clearJoinModeFlag,
    setPlayerName,
  } = useGame();
  const [localPlayerName, setLocalPlayerName] = useState(playerName || "");

  useEffect(() => {
    setLocalPlayerName(playerName || "");
  }, [playerName]);

  useEffect(() => {
    if (shouldShowJoinMode) {
      setMode("join");
      clearJoinModeFlag();
    }
  }, [shouldShowJoinMode, clearJoinModeFlag]);

  useEffect(() => {
    if (error) {
      console.log("MainMenu received error:", error);
      if (error.includes("Room not found")) {
        Alert.alert("Room Not Found", "Please enter an existing Room ID");
      } else {
        Alert.alert("Error", error);
      }
      clearError();
      setIsSubmitting(false);
    }
  }, [error, clearError]);

  const handleCreate = (e) => {
    e.preventDefault();

    if (!localPlayerName) {
      Alert.alert("Invalid Input", "Please enter a name to proceed");
      return;
    }

    if (!localPlayerName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    createRoom(localPlayerName.trim());

    // Reset submitting state after a delay
    setTimeout(() => setIsSubmitting(false), 3000);
  };

  const handleJoin = (e) => {
    e.preventDefault();

    if (!localPlayerName) {
      Alert.alert("Invalid Input", "Please enter a name to proceed");
      return;
    }

    if (!localPlayerName.trim() || isSubmitting) return;

    setMode("join");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!localPlayerName) {
      Alert.alert("Invalid Input", "Please enter a name to proceed");
      return;
    }

    if (!localPlayerName.trim() || isSubmitting) return;

    setIsSubmitting(true);

    if (mode === "create") {
      createRoom(localPlayerName);
    } else if (mode === "join") {
      if (!roomId.trim()) {
        Alert.alert("Invalid Input", "Please enter Room ID to proceed");
        setIsSubmitting(false);
        return;
      }
      joinRoom(roomId, localPlayerName.trim());
    }

    // Reset submitting state after a delay
    setTimeout(() => setIsSubmitting(false), 3000);
  };

  const handleQRScan = () => {
    if (!localPlayerName || !localPlayerName.trim()) {
      Alert.alert("Invalid Input", "Please enter a name to proceed");
      return;
    }
    // Save the player name to context before going to camera
    setPlayerName(localPlayerName.trim());
    goToCamera();
  };

  return (
    <View style={styles.mainView}>
      <Header>1 to 99</Header>
      <Text style={styles.subHeader}>
        Guess Everything Except the Secret Number
      </Text>

      {!mode && (
        <View style={styles.textInputView}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.textInput}
            value={localPlayerName}
            onChangeText={setLocalPlayerName}
            placeholder="Enter your name"
          />
        </View>
      )}

      {!mode ? (
        <View style={styles.buttonView}>
          <Button style={{ paddingVertical: 20 }} onPress={handleCreate}>
            Create Room
          </Button>
          <Button style={{ paddingVertical: 20 }} onPress={handleJoin}>
            Join Room
          </Button>
        </View>
      ) : (
        <View style={styles.joinModeContainer}>
          {mode === "join" && (
            <View style={styles.textInputView}>
              <Text style={styles.label}>Name:</Text>
              <TextInput
                style={styles.textInput}
                value={localPlayerName}
                onChangeText={setLocalPlayerName}
                placeholder="Enter your name"
              />
            </View>
          )}

          {mode === "join" && (
            <View style={styles.textInputView}>
              <Text style={styles.label}>Room:</Text>
              <TextInput
                style={styles.textInput}
                value={roomId}
                onChangeText={setRoomId}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="Enter Room ID"
              />
            </View>
          )}

          <View style={styles.buttonView}>
            <Button onPress={handleSubmit} disabled={isSubmitting}>
              {mode === "create" ? "Create Room" : "Join Room"}
            </Button>
            {mode === "join" && (
              <Button onPress={handleQRScan}>Scan QR Code</Button>
            )}
            <Button
              onPress={() => setMode("")}
              style={{ backgroundColor: Colors.DISABLE }}
            >
              Back
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    flex: 1,
    paddingBottom: 120,
  },
  subHeader: {
    fontFamily: "Poppins_400Regular",
    color: Colors.PRIMARY,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonView: {
    gap: 20,
    marginTop: 20,
    width: "80%",
  },
  textInputView: {
    flexDirection: "row",
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.PRIMARY,
    textAlign: "left",
    paddingLeft: 10,
    flex: 1,
    backgroundColor: "white",
    fontSize: 16,
  },
  label: {
    fontFamily: "DaysOne_400Regular",
    color: Colors.PRIMARY,
    fontSize: 20,
    textAlign: "center",
    padding: 0,
    margin: 0,
  },
  joinModeContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});

export default MainMenu;
