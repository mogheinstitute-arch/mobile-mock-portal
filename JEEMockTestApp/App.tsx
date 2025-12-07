import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';
import { TestProvider } from './src/context/TestContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import TestListScreen from './src/screens/TestListScreen';
import TestInstructionsScreen from './src/screens/TestInstructionsScreen';
import TestTakingScreen from './src/screens/TestTakingScreen';
import AdminScreen from './src/screens/AdminScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <TestProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="TestList" component={TestListScreen} />
            <Stack.Screen name="TestInstructions" component={TestInstructionsScreen} />
            <Stack.Screen name="TestTaking" component={TestTakingScreen} />
            <Stack.Screen name="Admin" component={AdminScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TestProvider>
    </AuthProvider>
  );
}
