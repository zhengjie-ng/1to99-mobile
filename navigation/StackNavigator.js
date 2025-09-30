import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainMenu from "../screens/MainMenu";
import GameLobby from "../screens/GameLobby";
import GamePlay from "../screens/GamePlay";
import GameFinished from "../screens/GameFinished";
import CameraScreen from "../screens/CameraScreen";

const Stack = createNativeStackNavigator();

function StackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "fade_from_bottom",
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="MENU" component={MainMenu} />
      <Stack.Screen name="LOBBY" component={GameLobby} />
      <Stack.Screen name="PLAYING" component={GamePlay} />
      <Stack.Screen name="FINISHED" component={GameFinished} />
      <Stack.Screen name="CAMERA" component={CameraScreen} />
    </Stack.Navigator>
  );
}

export default StackNavigator;
