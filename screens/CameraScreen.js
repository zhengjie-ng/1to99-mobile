import { View, Text, StyleSheet, Alert } from "react-native";
import { useState, useEffect, useRef } from "react";

import { CameraView, useCameraPermissions } from "expo-camera";
import Button from "../components/Button";
import { useGame } from "../context/GameContext";

function CameraScreen({ onBack, playerName }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [joinDialog, setJoinDialog] = useState(false);
  const { joinRoom, playerName: contextPlayerName, gameState } = useGame();

  // Use a ref to immediately block multiple scans
  const isProcessingRef = useRef(false);

  // Use playerName from context if available, otherwise fall back to prop
  const actualPlayerName = contextPlayerName || playerName;

  const handleBarCodeScanned = ({ type, data }) => {
    // Use ref for immediate blocking - prevents multiple rapid calls
    if (isProcessingRef.current || scanned || joinDialog) {
      console.log("🚫 Scan blocked - already processing");
      return;
    }

    // Immediately set ref to block subsequent calls
    isProcessingRef.current = true;
    setScanned(true);

    console.log(`📱 QR Code scanned: ${data}`);

    // Validate that the scanned data is a valid room ID (number)
    const roomId = parseInt(data);
    setJoinDialog(true);

    if (!isNaN(roomId) && roomId > 0) {
      Alert.alert("Room Found", `Join room ${roomId}?`, [
        {
          text: "Cancel",
          onPress: () => {
            setScanned(false);
            setJoinDialog(false);
            isProcessingRef.current = false; // Reset ref
          },
          style: "cancel",
        },
        {
          text: "Join",
          onPress: () => {
            console.log(
              `🔗 Joining room ${roomId} with player: "${actualPlayerName}"`
            );
            joinRoom(roomId.toString(), actualPlayerName);
            setJoinDialog(false);
            // Don't reset ref here - keep blocking until component unmounts
          },
        },
      ]);
    } else {
      Alert.alert(
        "Invalid QR Code",
        "This QR code doesn't contain a valid room ID",
        [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
              setJoinDialog(false);
              isProcessingRef.current = false; // Reset ref
            },
          },
        ]
      );
    }
  };

  // const handleBarCodeScanned = ({ type, data }) => {
  //   // Prevent multiple scans - more aggressive checking
  //   if (scanned || isJoining || hasJoined) {
  //     console.log("🚫 Scan blocked - already processed");
  //     return;
  //   }

  //   console.log(`📱 QR Code scanned: ${data}`);
  //   setScanned(true);

  //   // Validate that the scanned data is a valid room ID (number)
  //   const roomId = parseInt(data);
  //   if (!isNaN(roomId) && roomId > 0) {
  //     // Check if we have a player name before joining
  //     if (!actualPlayerName || actualPlayerName.trim() === "") {
  //       Alert.alert(
  //         "No Player Name",
  //         "Please go back and enter your name before scanning a QR code.",
  //         [
  //           {
  //             text: "OK",
  //             onPress: () => setScanned(false),
  //           },
  //         ]
  //       );
  //       return;
  //     }

  //     setIsJoining(true);
  //     setHasJoined(true);
  //     console.log(`🔗 Joining room ${roomId} with player name: "${actualPlayerName.trim()}"`);
  //     joinRoom(roomId.toString(), actualPlayerName.trim());

  //     // Don't navigate back immediately - let the game state change handle navigation
  //     console.log("✅ Join request sent, waiting for game state change...");
  //   } else {
  //     Alert.alert(
  //       "Invalid QR Code",
  //       "This QR code doesn't contain a valid room ID",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => setScanned(false),
  //         },
  //       ]
  //     );
  //   }
  // };

  // Waiting for permission
  if (!permission) {
    console.log("🎥 No permission object yet");
    return (
      <View style={[styles.permissionContainer, { backgroundColor: "blue" }]}>
        <Text
          style={[styles.permissionMessage, { color: "white", fontSize: 20 }]}
        >
          Loading camera permissions...
        </Text>
      </View>
    );
  }

  // If permission is not granted
  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: "orange" }]}>
        <Text
          style={[styles.permissionMessage, { color: "white", fontSize: 20 }]}
        >
          We need your permission to show the camera.
        </Text>
        <Button onPress={requestPermission}>Grant Permission</Button>
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      {!scanned && (
        <CameraView
          style={styles.fullScreenCamera}
          onBarcodeScanned={handleBarCodeScanned}
        />
      )}

      <View style={styles.buttonsContainer}>
        <Button style={styles.button} onPress={onBack}>
          Back
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionMessage: {
    textAlign: "center",
    marginBottom: 8,
  },
  fullScreenContainer: {
    flex: 1,
    width: 500,
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0,
    // width: '100%',
    // height: '100%',
    // zIndex: 1000,
  },
  fullScreenCamera: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  camera: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    position: "absolute",
    bottom: 64,
    left: 0,
    right: 0,
  },
  scanCompleteContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  scanCompleteText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#8a8a8a5e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
});

export default CameraScreen;
