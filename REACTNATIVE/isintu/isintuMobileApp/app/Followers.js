import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { supabase } from './apiService';

const Followers = () => {
  const [followers, setFollowers] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
      
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
    
        if (!user || !user.user || !user.user.id) {
          console.error('No user found or user ID is missing');
          return;
        }
    
        const { data: followerIds, error: followerError } = await supabase
          .from('followers')
          .select('follower_id')
          .eq('followed_id', user.user.id);
    
        if (followerError) throw followerError;

        if (!followerIds || followerIds.length === 0) {
          setFollowers([]);
          setFollowersCount(0);
          return;
        }

        const followerIdsArray = followerIds.map(f => f.follower_id);

       
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('full_name, id')
          .in('id', followerIdsArray);

        if (profilesError) throw profilesError;

       
        const followersWithProfiles = followerIds.map(f => {
          const profile = profiles.find(p => p.id === f.follower_id);
          return {
            ...f,
            profiles: profile || { full_name: 'Unknown' }
          };
        });

        setFollowers(followersWithProfiles);
        setFollowersCount(followersWithProfiles.length);
      } catch (error) {
        console.error('Error fetching followers:', error);
        Alert.alert('Error', 'Failed to fetch followers');
      }
    };

    fetchFollowers();
  }, []);

  const renderFollower = ({ item }) => {
    return (
      <View style={styles.followerItem}>
        <Text style={styles.followerText}>{item.profiles.full_name}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Followers: {followersCount}</Text>
      <FlatList
        data={followers}
        renderItem={renderFollower}
        keyExtractor={(item) => item.follower_id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#800000',
  },
  listContainer: {
    paddingBottom: 20,
  },
  followerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  followerText: {
    fontSize: 18,
  },
});

export default Followers;
