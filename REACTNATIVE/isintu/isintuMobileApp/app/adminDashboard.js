import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Text, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { PostsContext } from './PostsContext';
import PostItem from './PostItem';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { supabase } from './apiService'; // Adjust the path if needed

const AdminDashboard = () => {
  const navigation = useNavigation();
  const { posts, setPosts } = useContext(PostsContext);

  // Fetch posts function
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .rpc('fetch_posts_with_comments_and_likes_count');
    
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
  
  useEffect(() => {
    fetchPosts(); // Call the fetchPosts function here
  }, []);
  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      Alert.alert('Logged Out', 'You have been successfully logged out.');
      navigation.navigate('Login'); // Navigate to the login screen or wherever you want
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  // Render each post item
  const renderPost = ({ item, index }) => {
    return <PostItem post={item} index={index} />;
  };

  const deletePost = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('posts') // Adjust the table name if necessary
        .delete()
        .eq('id', postId);
  
      if (error) {
        throw error;
      }
  
      // Filter out the deleted post from the posts state
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  
      Alert.alert('Post Deleted', 'The post has been successfully deleted.');
    } catch (error) {
      console.error("Error deleting post:", error);
      Alert.alert('Delete Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Dashboard</Text>
        <Menu>
          <MenuTrigger>
            <Icon name="ellipsis-v" size={30} color="#800000" />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={() => navigation.navigate('Profile')}>
              <View style={styles.menuItem}>
                <Icon name="user" size={20} color="#800000" style={styles.menuIcon} />
                <Text style={styles.menuText}>Profile</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('Settings')}>
              <View style={styles.menuItem}>
                <Icon name="cog" size={20} color="#800000" style={styles.menuIcon} />
                <Text style={styles.menuText}>Settings</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={handleLogout}>
              <View style={styles.menuItem}>
                <Icon name="sign-out" size={20} color="#800000" style={styles.menuIcon} />
                <Text style={styles.menuText}>Logout</Text>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={30} color="#800000" />
          <Text style={styles.iconText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Followers')}>
          <Icon name="users" size={30} color="#800000" />
          <Text style={styles.iconText}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Requests')}>
          <Icon name="user-plus" size={30} color="#800000" />
          <Text style={styles.iconText}>Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('livestream')}>
          <Icon name="video-camera" size={30} color="#800000" />
          <Text style={styles.iconText}>Live</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.newPostButtonContainer}>
        <TouchableOpacity style={styles.newPostButton} onPress={() => navigation.navigate('NewPost')}>
          <Text style={styles.newPostButtonText}>Write a New Post</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.postsContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC'
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#800000',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIcon: {
    marginRight: 2,
  },
  menuText: {
    fontSize: 18,
    padding: 10,
    color: '#000',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  iconText: {
    marginTop: 5,
    fontSize: 14,
    color: '#800000',
  },
  newPostButtonContainer: {
    width: '80%',
    marginBottom: 20,
  },
  newPostButton: {
    backgroundColor: '#800000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
  },
  newPostButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminDashboard;