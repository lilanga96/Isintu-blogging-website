import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Image } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginSignupForm from './Register';
import AdminDashboard from './adminDashboard';
import UserDashboard from './userDashboard';
import Settings from './settings';
import Followers from './Followers';
import Requests from './NewRequests';
import NewPost from './NewPost';
import { PostsProvider } from './PostsContext';
import { MenuProvider } from 'react-native-popup-menu';
import Profile from './Profile';
import CommentsScreen from './CommentsScreen';
import { supabase } from './apiService';
import Notifications from './Notifications';
import LikesScreen from './LikesScreen';
import { UserProvider } from './userContext';
;

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const checkAuthState = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error.message);
      } else if (session) {
        setIsAuthenticated(true);
        await fetchUserRole(session.user.id);
      } else {
        setIsAuthenticated(false);
      }
    };

    const fetchUserRole = async (userId) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        setRole(profileData.role);
      } catch (error) {
        console.error('Error fetching user role:', error.message);
      }
    };

    checkAuthState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuthenticated(true);
        fetchUserRole(session.user.id);
      } else {
        setIsAuthenticated(false);
        setRole(null);
      }
    });

   
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => {
      subscription?.unsubscribe();
      clearTimeout(timer);
    };
  }, [rotateValue]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <MenuProvider>
      <PostsProvider>
        <UserProvider>
        <Stack.Navigator style={styles.navCont}>
          {isLoading ? (
            <Stack.Screen name="Loading">
              {() => (
                <View style={styles.container}>
                  <Image
                    source={require('./assets/finalImage.png')}
                    style={styles.logo}
                  />
                  <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />
                </View>
              )}
            </Stack.Screen>
          ) : (
            <>
              {isAuthenticated ? (
                <>
                  <Stack.Screen 
                    name="Dashboard" 
                    component={role === 'admin' ? AdminDashboard : UserDashboard} 
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="Followers" component={Followers} />
                  <Stack.Screen name="Notifications" component={Notifications} />
                  <Stack.Screen name="Requests" component={Requests} />
                  <Stack.Screen name="Settings" component={Settings} />
                  <Stack.Screen name="NewPost" component={NewPost} />
                  <Stack.Screen name="Profile" component={Profile} />
                  <Stack.Screen name="Comments" component={CommentsScreen} />
                  <Stack.Screen name="LikesScreen" component={LikesScreen} />
                  <Stack.Screen 
                    name="Home" 
                    component={role === 'admin' ? AdminDashboard : UserDashboard} 
                    options={{ headerShown: false }}
                  />
                </>
              ) : (
                <Stack.Screen name="Login" component={LoginSignupForm} options={{ headerShown: false }} />
              )}
            </>
          )}
        </Stack.Navigator>
        </UserProvider>
      </PostsProvider>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  navCont: {
    backgroundColor: '#FFFFFF'
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  spinner: {
    borderWidth: 3,
    borderColor: '#800000',
    borderTopColor: '#fff',
    borderRadius: 25,
    width: 40,
    height: 40,
  },
});

export default App;
