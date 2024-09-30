import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Image } from 'react-native';
import { supabase } from './apiService';
import Icon from 'react-native-vector-icons/FontAwesome';

const NewRequests = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_pending_posts_with_profiles'); 
    
        if (error) {
          console.error('Error fetching posts:', error);
          throw error;
        }
    
        console.log('Fetched posts:', data);
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        Alert.alert('Error', 'Failed to fetch posts');
      }
    };
    
    fetchPosts();
  }, []);

  const sendNotificationToAllUsers = async (postText) => {
    try {
   
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      if (usersError) throw usersError;

      const notifications = users.map((user) => ({
        user_id: user.id,
        message: `New post by Isintu Siyabukwa: ${postText}`,
        status: 'unread',
      }));

   
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifyError) throw notifyError;

    } catch (error) {
      console.error('Error sending notifications:', error.message);
      Alert.alert('Error', 'Failed to send notifications');
    }
  };

  const handleApprove = async (postId, postText) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({ status: 'published' })
        .eq('id', postId);
  
      if (error) throw error;
  
      console.log('Update response:', data); 
      
      await sendNotificationToAllUsers(postText);
      
      setPosts(posts.filter(post => post.id !== postId));
      Alert.alert('Success', 'Post approved and published.');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve post');
    }
  };
  
  const handleReject = async (postId) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

     
      setPosts(posts.filter(post => post.id !== postId));
      Alert.alert('Success', 'Post rejected and deleted.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject post');
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.authorName}>{item.full_name}</Text>
      <Text style={styles.postText}>{item.text}</Text>
      {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
      {item.video && <Text style={styles.videoText}>Video added!</Text>}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleApprove(item.id, item.text)}
        >
          <Icon name="check" size={20} color="#fff" />
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleReject(item.id)}
        >
          <Icon name="times" size={20} color="#fff" />
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
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
  listContainer: {
    paddingBottom: 20,
  },
  postContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingVertical: 10,
  },
  authorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postText: {
    fontSize: 16,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  videoText: {
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#800000',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
});

export default NewRequests;
