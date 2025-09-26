import { StyleSheet, Text } from "react-native";
import { Colors } from "../styles/colors";

function Header({ children, style }) {
  return <Text style={[styles.headerText, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  headerText: {
    fontFamily: "DaysOne_400Regular",
    color: Colors.PRIMARY,
    fontSize: 60,
    textAlign: "center",
  },
});
export default Header;
