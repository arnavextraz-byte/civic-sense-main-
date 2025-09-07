import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./HomeScreen";
import ReportScreen from "./ReportScreen";
import PreviousReportsScreen from "./PreviousReportsScreen";
import { EventSourcePolyfill } from "react-native-sse";



if (typeof global.EventSource === "undefined") {
  global.EventSource = EventSourcePolyfill;
}

// demo
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Report Offence" component={ReportScreen} />
  <Stack.Screen name="Previous Reports" component={PreviousReportsScreen} />
</Stack.Navigator>

    </NavigationContainer>
  );
}
