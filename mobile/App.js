import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ResourceListScreen from './src/screens/ResourceListScreen';
import AllocationsScreen from './src/screens/AllocationsScreen';
import AssignResourceScreen from './src/screens/AssignResourceScreen';
import AddResourceScreen from './src/screens/AddResourceScreen';
import MyAllocationsScreen from './src/screens/MyAllocationsScreen';
import PendingRequestsScreen from './src/screens/PendingRequestsScreen';
import UserListScreen from './src/screens/UserListScreen';
import AddUserScreen from './src/screens/AddUserScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Resources" component={ResourceListScreen} />
          <Stack.Screen name="Allocations" component={AllocationsScreen} />
          <Stack.Screen name="AssignResource" component={AssignResourceScreen} />
          <Stack.Screen name="AddResource" component={AddResourceScreen} />
          <Stack.Screen name="MyAllocations" component={MyAllocationsScreen} />
          <Stack.Screen name="PendingRequests" component={PendingRequestsScreen} />
          <Stack.Screen name="Users" component={UserListScreen} />
          <Stack.Screen name="AddUser" component={AddUserScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
