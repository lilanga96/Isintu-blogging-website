import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { supabase } from './apiService'; // Adjust the path if needed

const Settings = () => {
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        // Get the current logged-in admin
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError || !user || !user.user || !user.user.id) {
          throw new Error('User not found');
        }

        // Fetch followers of the admin
        const { data, error } = await supabase
          .from('followers') // Replace with your actual table name
          .select('id')
          .eq('followed_id', user.user.id); // Ensure you have a column that links followers to the admin

        if (error) throw error;

        setFollowers(data);
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };

    fetchFollowers();
  }, []);

  const handleBlockFollower = async (follower_id) => {
    try {
      // Block the follower (remove from followers list)
      const { error } = await supabase
        .from('followers') // Replace with your actual table name
        .delete()
        .eq('id', follower_id);

      if (error) throw error;

      setFollowers(followers.filter(follower => follower.id !== follower_id));
      Alert.alert('Success', 'Follower blocked successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderFollower = ({ item }) => (
    <View style={styles.followerItem}>
      <Text style={styles.followerText}>{item.username}</Text>
      <TouchableOpacity onPress={() => handleBlockFollower(item.id)}>
        <Text style={styles.blockButton}>Block</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Settings</Text>
      <FlatList
        data={followers}
        renderItem={renderFollower}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.followerList}
      />
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
  },
  followerList: {
    width: '100%',
  },
  followerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  followerText: {
    fontSize: 18,
  },
  blockButton: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
});

export default Settings;
