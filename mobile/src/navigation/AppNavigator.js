import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import InterviewsScreen from '../screens/InterviewsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ResumeAnalysisScreen from '../screens/ResumeAnalysisScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import CoursesScreen from '../screens/CoursesScreen';
import LiveInterviewScreen from '../screens/LiveInterviewScreen';
import InterviewResultScreen from '../screens/InterviewResultScreen';

// Icons (Using basic text/emoji or lucide if installed)
let Lucide;
try {
  Lucide = require('lucide-react-native');
} catch (e) {
  // Fallback if not loaded yet
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = '🏠';
          else if (route.name === 'Interviews') iconName = '🎙️';
          else if (route.name === 'History') iconName = '📊';
          else if (route.name === 'Resume') iconName = '📄';
          else if (route.name === 'Courses') iconName = '🎓';
          else if (route.name === 'Challenges') iconName = '💻';

          if (Lucide) {
            // Can render Lucide icons here if desired
          }
          // Simple text emoji fallback works on all devices and looks clean
          const TabIcon = () => (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator style={{ display: 'none' }} />
              {/* Emojis look great, keep it lightweight */}
              <Text style={{ fontSize: size }}>{iconName}</Text>
            </View>
          );
          return <TabIcon />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#0F172A',
          borderBottomColor: '#1E293B',
          borderBottomWidth: 1,
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Interviews" component={InterviewsScreen} />
      <Tab.Screen name="Courses" component={CoursesScreen} />
      <Tab.Screen name="Resume" component={ResumeAnalysisScreen} options={{ title: 'Resume ATS' }} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userEmail', firebaseUser.email || '');
        await AsyncStorage.setItem('userFullName', firebaseUser.displayName || 'User');
        setUser(firebaseUser);
      } else {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userFullName');
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="LiveInterview" component={LiveInterviewScreen} />
          <Stack.Screen name="InterviewResult" component={InterviewResultScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
