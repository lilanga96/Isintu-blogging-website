import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from './apiService'; // Adjust the path if needed

const Profile = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateUsername = async () => {
    try {
      // Get the current logged-in user
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user || !user.user || !user.user.id) {
        throw new Error('User not found');
      }

      // Update the username in the 'profiles' table
      const { error } = await supabase
        .from('profiles')
        .update({ full_name })
        .eq('id', user.user.id);

      if (error) throw error;

      Alert.alert('Success', 'Username updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user || !user.user || !user.user.id) {
        throw new Error('User not found');
      }

      // Update the password
      const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });

      if (passwordError) throw passwordError;

      Alert.alert('Success', 'Password updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="New Username"
        value={username}
        onChangeText={setUsername}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateUsername}>
        <Text style={styles.buttonText}>Update Username</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Current Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#800000',
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 5,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#800000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 15
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;
