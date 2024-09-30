import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { supabase } from './apiService';

const LikesScreen = ({ route }) => {
  const { postId } = route.params || {}; 

  const [likes, setLikes] = useState([]);

  useEffect(() => {
    const fetchLikes = async () => {
      
      if (!postId) {
        console.error('postId is undefined');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('post_likes')
          .select('user_id, profiles(full_name)')
          .eq('post_id', postId);

        if (error) {
          console.error('Error fetching likes:', error);
          return;
        }

        setLikes(data); 
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    fetchLikes();
  }, [postId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>People who liked this post:</Text>
      <FlatList
        data={likes}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item }) => (
          <Text style={styles.name}>
            {item.profiles?.full_name || 'Anonymous'}
          </Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    marginBottom: 5,
    color: '#800000',
  },
});

export default LikesScreen;
