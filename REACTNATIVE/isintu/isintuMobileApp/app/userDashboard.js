import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { PostsContext } from './PostsContext';
import PostItem from './PostItem';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { supabase } from './apiService';

const UserDashboard = () => {
  const navigation = useNavigation();
  const { posts, setPosts } = useContext(PostsContext);
  const [admin, setAdmin] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
   
    const fetchAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('full_name', 'Siphesihle')
          .single();

        if (error) throw error;
        setAdmin(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch admin data');
      }
    };

    fetchAdmin();
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('fetch_posts_with_comments_and_likes_count');

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to fetch posts');
    }
  }, [setPosts]);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not found. Please log in.');

     
      const { data: unreadNotificationsData, error: unreadError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'unread');

      if (unreadError) throw unreadError;

      setUnreadNotifications(unreadNotificationsData.length);
    } catch (error) {
      console.error('Error fetching unread notifications:', error.message);
    }
  }, []);

  const markNotificationsAsRead = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not found. Please log in.');

      
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('user_id', user.id)
        .eq('status', 'unread');

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error marking notifications as read:', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
      fetchUnreadNotifications();
    }, [fetchPosts, fetchUnreadNotifications])
  );

  const handleFollow = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not found. Please log in.');
      if (!admin) throw new Error('Admin not found.');

      
      const { data: existingFollow, error: followError } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', user.id)
        .eq('followed_id', admin.id)
        .single();

      if (followError && followError.code !== 'PGRST116') throw followError;
      if (existingFollow) {
        Alert.alert('Already Following', 'You are already following the admin.');
        return;
      }

     
      const { error } = await supabase
        .from('followers')
        .insert([{ follower_id: user.id, followed_id: admin.id }]);

      if (error) throw error;
      Alert.alert('Success', 'You are now following Isintu Siyabukwa');
    } catch (error) {
      console.error('Error:', error.message);
      Alert.alert('Error', error.message || 'Failed to follow admin');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      Alert.alert('Logged Out', 'You have been successfully logged out.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  const handleNotificationsPress = () => {
    navigation.navigate('Notifications');
    markNotificationsAsRead();
  };

  const renderPost = ({ item, index }) => {
    return <PostItem post={item} index={index} />;
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

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleNotificationsPress}
        >
          <Icon name="bell" size={28} color="#800000" />
          {unreadNotifications > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{unreadNotifications}</Text>
            </View>
          )}
          <Text style={styles.iconText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={handleFollow}>
          <Icon name="user-plus" size={28} color="#800000" />
          <Text style={styles.iconText}>Follow Isintu</Text>
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
        style={{ width: '100%' }}
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
    borderBottomColor: '#CCCCCC',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#800000',
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
  notificationBadge: {
    position: 'absolute',
    right: 0,
    top: -10,
    backgroundColor: '#800000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
 
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  menuIcon: {
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#800000',
  },


});

export default UserDashboard;
