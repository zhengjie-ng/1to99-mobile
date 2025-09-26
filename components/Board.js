import { View, StyleSheet } from "react-native";
import { Colors } from "../styles/colors";

function Board({ children, style }) {
  return <View style={[styles.board, style]}>{children}</View>;
}

export default Board;

const styles = StyleSheet.create({
  board: {
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
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
});
