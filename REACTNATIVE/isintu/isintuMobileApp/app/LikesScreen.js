// LikesScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { fetchPostLikes } from './apiService'; // Ensure this import is correct

const LikesScreen = ({ route }) => {
  // Ensure `route` is destructured properly
  const { postId } = route.params || {}; // Safeguard against undefined params

  const [likes, setLikes] = useState([]);

  useEffect(() => {
    if (postId) { // Ensure postId is valid before fetching data
      const getLikes = async () => {
        const fetchedLikes = await fetchPostLikes(postId);
        setLikes(fetchedLikes);
      };

      getLikes();
    }
  }, [postId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>People who liked this post:</Text>
      <FlatList
        data={likes}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item }) => (
          <Text style={styles.name}>{item.profiles.full_name}</Text>
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
