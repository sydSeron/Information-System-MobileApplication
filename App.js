import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import HomeworkScreen from './screens/HomeworkScreen';
import GradesScreen from './screens/GradesScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import AdminDashboard from './screens/AdminDashboard';
import EditUser from './screens/EditUser';
import ManageGrades from './screens/ManageGrades';
import AddUser from './screens/AddUser';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Schedule" component={ScheduleScreen} />
          <Stack.Screen name="Homework" component={HomeworkScreen} />
          <Stack.Screen name="Grades" component={GradesScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
          <Stack.Screen name="EditUser" component={EditUser} options={{ headerShown: false }} />
          <Stack.Screen name="ManageGrades" component={ManageGrades} options={{ headerShown: false }} />
          <Stack.Screen name="AddUser" component={AddUser} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}