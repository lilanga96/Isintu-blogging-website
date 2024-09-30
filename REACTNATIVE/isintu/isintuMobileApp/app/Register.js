import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './apiService';

const LoginSignupForm = () => {
  const navigation = useNavigation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
  
     
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
  
      if (profileError) throw profileError;
  
      if (profileData.role === 'admin') {
        Alert.alert('Login Successful', 'Welcome back, Admin!');
      } else {
        Alert.alert('Login Successful', 'Welcome back!');
      }
  
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };
  

  const handleSignup = async () => {
    try {
     
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: userName,
          },
        },
      });
  
      if (authError) throw authError;
  
  
      const { user } = authData;
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id, 
          role: 'user', 
          full_name: userName, 
        },
      ]);
  
      if (profileError) throw profileError;
  
      Alert.alert('Signup Successful', `Welcome, ${userName}. Please confirm your email.`);
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    }
  };
  

  return (
    <View style={styles.container}>
      <Image source={require('./assets/finalImage222.png')} style={styles.image} />
      {isLogin ? (
        <>
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <Text style={styles.switchText} onPress={() => setIsLogin(false)}>
            Don't have an account? Sign up
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.title}>Sign Up</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={userName}
            onChangeText={setUserName}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <Text style={styles.switchText} onPress={() => setIsLogin(true)}>
            Already have an account? Login
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: 350,
    height: 350,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 35,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  switchText: {
    color: '#800000',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#800000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default LoginSignupForm;
