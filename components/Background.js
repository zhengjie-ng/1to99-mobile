import { useRef, useEffect } from "react";
import { Animated, ImageBackground, StyleSheet } from "react-native";

function Background() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.imageBackground, { opacity: fadeAnim }]}>
      <ImageBackground
        source={require("../assets/images/pattern.jpg")}
        style={styles.imageBackgroundContainer}
        imageStyle={styles.imageStyle}
        resizeMode="repeat"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
});

export default Background;
