import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  AppState,
} from "react-native";
import { useGame } from "../context/GameContext";
import Button from "../components/Button";
import { Colors } from "../styles/colors";
import Header from "../components/Header";
import Board from "../components/Board";
import QRCode from "react-qr-code";
import { useRef, useEffect } from "react";
import Background from "../components/Background";
import { SafeAreaView } from "react-native-safe-area-context";

function GameLobby() {
  const { gameRoom, playerName, startGame, quitGame, removePlayer } = useGame();
  const scrollViewRef = useRef(null);

  const handleScrollToEnd = (contentWidth, contentHeight) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        // Player is leaving the app, quit the game
        if (gameRoom && playerName) {
          quitGame();
        }
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [gameRoom, playerName, quitGame]);

  if (!gameRoom)
    return (
      <View style={{ flex: 1, position: "relative" }}>
        <Background />
        <SafeAreaView
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Header style={{ fontSize: 24 }}>Loading lobby...</Header>
        </SafeAreaView>
      </View>
    );

  const currentPlayer = gameRoom.players.find((p) => p.name === playerName);
  const isHost =
    currentPlayer &&
    (currentPlayer.isHost || currentPlayer.id === gameRoom.hostId);

  return (
    <View style={styles.screenContainer}>
      <Background />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainView}>
          <View style={styles.qrContainer}>
            <Text style={styles.qrLabel}>
              Scan QR code or enter Room ID to join
            </Text>
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={gameRoom.roomId.toString()}
                size={140}
                bgColor="white"
                fgColor="black"
              />
            </View>
            <Text style={styles.roomIdText}>{gameRoom.roomId}</Text>
          </View>

          <Board style={{ width: "85%", minHeight: 0, flex: 1, marginTop: 0 }}>
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={handleScrollToEnd}
            >
              <View
                style={{
                  flex: 1,
                  width: 300,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Header style={{ fontSize: 25, marginBottom: 12 }}>
                  Players ({gameRoom.players.length})
                </Header>
                {gameRoom.players.map((player, index) => {
                  const isPlayerHost =
                    player.isHost || player.id === gameRoom.hostId;
                  const canRemove =
                    isHost && !isPlayerHost && player.name !== playerName;
                  return (
                    <View key={index} style={styles.playerRow}>
                      <Text style={styles.playerText}>
                        {player.name} {isPlayerHost && "(Host)"}
                      </Text>
                      {canRemove && (
                        <Pressable
                          onPress={() => {
                            Alert.alert(
                              "Remove Player",
                              `Are you sure you want to remove ${player.name} from the game?`,
                              [
                                {
                                  text: "Cancel",
                                  style: "cancel",
                                },
                                {
                                  text: "Remove",
                                  style: "destructive",
                                  onPress: () => removePlayer(player.name),
                                },
                              ]
                            );
                          }}
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              color: Colors.EXIT,
                              fontWeight: 800,
                              paddingRight: 5,
                            }}
                          >
                            X
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </Board>

          <View style={styles.buttonContainer}>
            {!isHost && (
              <View>
                <Text style={styles.waitingText}>
                  Waiting for host to start the game...
                </Text>
              </View>
            )}
            {isHost && (
              <Button
                onPress={startGame}
                style={{ backgroundColor: Colors.PRIMARY }}
              >
                Start Game
              </Button>
            )}
            <Button onPress={quitGame} style={{ backgroundColor: Colors.EXIT }}>
              Leave Game
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    position: "relative",
  },
  safeArea: {
    flex: 1,
  },
  mainView: {
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    width: "100%",
    marginTop: 0,
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  playersText: {
    fontFamily: "DaysOne_400Regular",
    color: Colors.PRIMARY,
    fontSize: 25,
    textAlign: "center",
    marginBottom: 12,
  },

  playerText: {
    fontFamily: "Poppins_400Regular",
    color: Colors.GRAY,
    fontSize: 20,
    flex: 1,
    textAlign: "center",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    marginVertical: 2,
  },
  waitingView: {
    backgroundColor: Colors.PRIMARY_LIGHT,
    width: "100%",
    justifyContent: "top",
    alignItems: "center",
    padding: 10,
    minHeight: 300,
    borderRadius: 10,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  buttonContainer: {
    gap: 10,
    width: "85%",
  },
  waitingText: {
    color: Colors.GRAY,
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: Colors.PRIMARY_LIGHT,
    padding: 20,
    width: "85%",
    borderRadius: 10,
    marginVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  qrLabel: {
    fontFamily: "Poppins_400Regular",
    color: Colors.GRAY,
    fontSize: 14,
    marginBottom: 10,
  },
  qrCodeWrapper: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  roomIdText: {
    fontFamily: "DaysOne_400Regular",
    color: Colors.PRIMARY,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default GameLobby;
