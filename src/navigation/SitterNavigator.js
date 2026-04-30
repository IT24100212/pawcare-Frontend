import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SitterDashboardScreen from '../screens/staff/SitterDashboardScreen';
import BoardingUpdatesScreen from '../screens/staff/BoardingUpdatesScreen';

const Stack = createNativeStackNavigator();

const SitterNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="SitterDashboard" 
        component={SitterDashboardScreen} 
      />
      <Stack.Screen 
        name="BoardingUpdates" 
        component={BoardingUpdatesScreen} 
        options={{ title: 'Daily Pawtocasts', headerShown: true }} 
      />
    </Stack.Navigator>
  );
};

export default SitterNavigator;
