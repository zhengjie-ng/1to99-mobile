import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useGame } from "../context/GameContext";
import Header from "../components/Header";
import Board from "../components/Board";
import Button from "../components/Button";
import { Colors } from "../styles/colors";

function GamePlay() {
  const [guess, setGuess] = useState("");
  const scrollViewRef = useRef(null);
  const {
    gameRoom,
    playerName,
    makeGuess,
    gameHistory,
    quitGame,
    removePlayer,
  } = useGame();

  // Auto-scroll to current player when turn changes
  useEffect(() => {
    if (
      gameRoom &&
      scrollViewRef.current &&
      typeof gameRoom.currentPlayerIndex === "number"
    ) {
      const currentPlayerIndex = gameRoom.currentPlayerIndex;
      // Approximate scroll position based on player index
      // Each player row is roughly 80px in height
      const scrollPosition = currentPlayerIndex * 80;

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: true,
        });
      }, 100);
    }
  }, [gameRoom?.currentPlayerIndex]);

  if (!gameRoom)
    return (
      <View>
        <Text>Loading game...</Text>
      </View>
    );

  const currentPlayer = gameRoom.players[gameRoom.currentPlayerIndex];
  const isMyTurn = currentPlayer.name === playerName;
  const isSingleNumberLeft = gameRoom.minRange === gameRoom.maxRange;

  const myPlayer = gameRoom.players.find((p) => p.name === playerName);
  const isHost =
    myPlayer && (myPlayer.isHost || myPlayer.id === gameRoom.hostId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isMyTurn || !guess.trim()) return;

    const guessNum = parseInt(guess);
    if (guessNum < gameRoom.minRange || guessNum > gameRoom.maxRange) {
      Alert.alert(
        "Invalid Guess",
        `Guess must be between ${gameRoom.minRange} and ${gameRoom.maxRange}`
      );
      return;
    }

    makeGuess(guessNum);
    setGuess("");
  };

  const handleLeaveGame = () => {
    Alert.alert("Leave Game", "Are you sure you want to leave the game?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => quitGame(),
      },
    ]);
  };

  return (
    <View
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        flex: 1,
        marginTop: 10,
        gap: 15,
        width: "100%",
      }}
    >
      <View>
        <Header style={{ fontSize: 38 }}>Do not pick the </Header>
        <Header style={{ fontSize: 38 }}>Secret Number!</Header>
      </View>

      <Board
        style={{
          width: "90%",
          minHeight: 100,
          justifyContent: "center",
          gap: 20,
          paddingTop: 20,
          paddingBottom: 20,
          margin: 0,
        }}
      >
        <Header style={{ fontSize: 25 }}>
          Current Range: {gameRoom.minRange} - {gameRoom.maxRange}
        </Header>
        {isSingleNumberLeft ? (
          <Header style={{ fontSize: 17, color: Colors.EXIT }}>
            {currentPlayer.name} must pick {gameRoom.minRange} and will lose!
          </Header>
        ) : (
          <Header style={{ fontSize: 17, color: Colors.GRAY }}>
            Current Turn: {currentPlayer.name}
            {isMyTurn && (
              <Text style={{ color: Colors.SECONDARY_DARK }}>(Your Turn!)</Text>
            )}
          </Header>
        )}
      </Board>
      {isMyTurn && !isSingleNumberLeft && (
        <Board
          style={{
            width: "90%",
            minHeight: 0,
            height: 100,
            justifyContent: "center",
            gap: 2,
            paddingTop: 20,
            paddingBottom: 20,
            flexDirection: "row",
            margin: 0,
          }}
        >
          <TextInput
            style={styles.textInput}
            value={guess}
            onChangeText={setGuess}
            keyboardType="number-pad"
            returnKeyType="done"
            min={gameRoom.minRange}
            max={gameRoom.maxRange}
            placeholder={`Guess (${gameRoom.minRange}-${gameRoom.maxRange})`}
          />
          <Button onPress={handleSubmit}>Guess</Button>
        </Board>
      )}
      <Board
        style={{
          width: "90%",
          minHeight: 0,
          flex: 1,
          justifyContent: "start",
          gap: 5,
          margin: 0,
        }}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, width: "100%" }}
          showsVerticalScrollIndicator={false}
        >
          <Header style={{ fontSize: 25 }}>Players</Header>
          {gameRoom.players.map((player, index) => {
            const isCurrentTurn = index === gameRoom.currentPlayerIndex;
            const isPlayerHost = player.isHost || player.id === gameRoom.hostId;
            const canRemove =
              isHost &&
              !isPlayerHost &&
              player.name !== playerName &&
              !isCurrentTurn;
            const playerGuesses = gameHistory.filter(
              (turn) => turn.playerName === player.name
            );
            const lastGuess = playerGuesses[playerGuesses.length - 1];

            return (
              <View
                key={player.name}
                style={[
                  styles.playerRow,
                  isCurrentTurn && styles.currentPlayerRow,
                ]}
              >
                <View style={styles.playerInfo}>
                  <Text
                    style={[
                      styles.playerName,
                      isCurrentTurn && styles.currentPlayerText,
                    ]}
                  >
                    {player.name}
                    {isCurrentTurn && " (Current Turn)"}
                    {isPlayerHost && " (Host)"}
                  </Text>
                  <Text
                    style={[
                      styles.playerGuess,
                      isCurrentTurn && styles.currentPlayerText,
                    ]}
                  >
                    {lastGuess
                      ? `Last: ${lastGuess.guess} (${lastGuess.result})`
                      : "No guesses yet"}
                  </Text>
                </View>
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
                      }}
                    >
                      X
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </ScrollView>
      </Board>

      <Button
        onPress={handleLeaveGame}
        style={{ backgroundColor: Colors.EXIT }}
      >
        Leave Game
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    height: 65,
    minHeight: 50,
    margin: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.PRIMARY,
    textAlign: "left",
    paddingLeft: 10,
    backgroundColor: "white",
    fontSize: 20,
    width: 180,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: "transparent",
    width: "100%",
  },
  playerInfo: {
    flex: 1,
  },
  currentPlayerRow: {
    backgroundColor: Colors.SECONDARY_LIGHT,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 4,
  },
  playerGuess: {
    fontSize: 14,
    color: Colors.GRAY,
  },
  currentPlayerText: {
    color: Colors.SECONDARY_DARK,
  },
  removeButtonSmall: {
    backgroundColor: Colors.EXIT,
    width: 30,
    height: 30,
    borderRadius: 15,
    padding: 0,
    minWidth: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GamePlay;
