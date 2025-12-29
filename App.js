import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import screens
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import PlantListScreen from "./screens/PlantListScreen";
import AddPlantScreen from "./screens/AddPlantScreen";
import PersonalitySetupScreen from "./screens/PersonalitySetupScreen";
import ChatScreen from "./screens/ChatScreen";
import PlantDetailsScreen from "./screens/PlantDetailsScreen";
import EditPlantScreen from "./screens/EditPlantScreen";

//firebase
import { useEffect } from "react";
import { auth, db } from "./firebaseConfig";

const AuthStack = createStackNavigator();
const MainStack = createStackNavigator();
const RootStack = createStackNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function MainStackScreen() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="PlantList" component={PlantListScreen} />
      <MainStack.Screen name="PlantDetails" component={PlantDetailsScreen} />
      <MainStack.Screen name="AddPlant" component={AddPlantScreen} />
      <MainStack.Screen
        name="PersonalitySetup"
        component={PersonalitySetupScreen}
      />
      <MainStack.Screen name="Chat" component={ChatScreen} />
      <MainStack.Screen name="EditPlant" component={EditPlantScreen} />
    </MainStack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    console.log("Firebase Auth:", auth);
    console.log("Firebase DB:", db);
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Auth"
      >
        <RootStack.Screen name="Auth" component={AuthStackScreen} />
        <RootStack.Screen name="Main" component={MainStackScreen} />
      </RootStack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
