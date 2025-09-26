import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import Button from "../components/Button";
import { Colors } from "../styles/colors";
import Header from "../components/Header";
import Board from "../components/Board";

function GameFinished() {
  const {
    gameHistory,
    quitGame,
    backToLobby,
    restartGame,
    gameRoom,
    // playerName,
  } = useGame();
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(true);

  const lastTurn = gameHistory[gameHistory.length - 1];
  const loser = lastTurn ? lastTurn.playerName : "Unknown";

  // const currentPlayer = gameRoom?.players?.find((p) => p.name === playerName);
  // const isHost =
  //   currentPlayer &&
  //   (currentPlayer.isHost || currentPlayer.id === gameRoom.hostId);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerActive]);

  // Handle auto-return to lobby when timer reaches 0
  useEffect(() => {
    if (!timerActive && timeLeft === 0) {
      restartGame();
    }
  }, [timerActive, timeLeft, restartGame]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      setTimerActive(false);
    };
  }, []);

  // const handleBackToLobby = () => {
  //   setTimerActive(false);
  //   backToLobby();
  // };

  const handleQuitGame = () => {
    setTimerActive(false);
    quitGame();
  };

  const handleRestartGame = () => {
    setTimerActive(false);
    restartGame();
    backToLobby();
  };

  return (
    <View
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        // marginTop: 10,
      }}
    >
      <Header style={{ fontSize: 50 }}>Game Over!</Header>
      <Board style={{ minHeight: 0, width: 380 }}>
        <Header style={{ fontSize: 40, color: Colors.GRAY }}>
          {loser} <Text style={{ color: Colors.EXIT }}>Lost!</Text>
        </Header>
      </Board>

      {timerActive && timeLeft > 0 && (
        <Board style={{ minHeight: 0, width: 380, marginVertical: 10 }}>
          <Header style={{ fontSize: 18, color: Colors.PRIMARY }}>
            Auto return to lobby in:{" "}
            <Text style={{ color: Colors.EXIT, fontWeight: "bold" }}>
              {timeLeft}s
            </Text>
          </Header>
        </Board>
      )}

      <Board style={{ minHeight: 0, width: 380 }}>
        <Header style={{ fontSize: 20, color: Colors.GRAY }}>
          Secret Number:
          <Text style={{ color: Colors.EXIT }}> {lastTurn?.guess}</Text>
        </Header>
        <Header style={{ fontSize: 20, color: Colors.GRAY }}>
          Total Guesses: {gameHistory.length}
        </Header>
      </Board>

      <Board
        style={{
          width: 380,
          height: 300,
          justifyContent: "start",
          gap: 5,
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        <ScrollView
          style={{ flex: 1, width: "100%" }}
          showsVerticalScrollIndicator={false}
        >
          <Header style={{ fontSize: 25 }}>Players</Header>
          {gameRoom.players.map((player, index) => {
            const isCurrentTurn = index === gameRoom.currentPlayerIndex;
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
                <Text
                  style={[
                    styles.playerName,
                    isCurrentTurn && styles.currentPlayerText,
                  ]}
                >
                  {player.name}
                  {isCurrentTurn && " (Last Turn)"}
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
            );
          })}
        </ScrollView>
      </Board>

      <View style={{ gap: 20, width: 380 }}>
        {/* {isHost && (
          <Button
            onPress={handleRestartGame}
            style={{ backgroundColor: Colors.PRIMARY }}
          >
            Restart Game (New Players Can Join)
          </Button>
        )} */}
        <Button onPress={handleRestartGame}>Back to Lobby</Button>
        <Button
          onPress={handleQuitGame}
          style={{ backgroundColor: Colors.EXIT }}
        >
          Quit Game
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerRow: {
    padding: 10,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: "transparent",
    width: "100%",
  },
  currentPlayerRow: {
    backgroundColor: Colors.EXIT_LIGHT,
    borderWidth: 2,
    borderColor: Colors.EXIT,
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
    color: Colors.EXIT,
  },
});

export default GameFinished;
