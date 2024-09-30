import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { PostsContext } from './PostsContext';
import { Video } from 'expo-av';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { supabase } from './apiService'; 
import { ScrollView } from 'react-native-gesture-handler';

const PostItem = ({ post, index }) => {
  const { deletePost, toggleLike } = useContext(PostsContext);
  const navigation = useNavigation();
  const [isAdmin, setIsAdmin] = useState(false);

  const supabaseUrl = 'https://wketpjwycjjklyefpyxm.supabase.co';

  
  const images = Array.isArray(post.image) ? post.image.map(image => `${supabaseUrl}/storage/v1/object/public/post-images/${image}`) : [];

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('User not found. Please log in.');

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setIsAdmin(profileData.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error.message);
      }
    };

    checkAdminStatus();
  }, []);

  const handleToggleLike = () => {
    toggleLike(post.id, index);
  };

  const handleViewLikes = () => {
    navigation.navigate('LikesScreen', { postId: post.id });
  };

  const handleCommentPress = () => {
    navigation.navigate('Comments', { postIndex: index });
  };

  const handleDeletePost = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => deletePost(post.id)
        }
      ]
    );
  };

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Text style={styles.companyName}>Isintu Siyabukwa</Text>
        {isAdmin && (
          <Menu>
            <MenuTrigger>
              <Icon name="ellipsis-v" size={20} color="#800000" />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={handleDeletePost}>
                <View style={styles.menuOption}>
                  <Icon name="trash" size={16} color="#800000" style={styles.menuIcon} />
                  <Text>Delete</Text>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
        )}
      </View>
      <Text style={styles.postText}>{post.text}</Text>
      {images.length > 0 && (
        <ScrollView horizontal>
          {images.map((imageUri, imageIndex) => (
            <Image 
              key={imageIndex}
              source={{ uri: imageUri }} // Use constructed URI
              style={styles.postImage}
              onError={() => console.log(`Error loading image: ${imageUri}`)}
            />
          ))}
        </ScrollView>
      )}
      {post.video && (
        <Video
          source={{ uri: post.video }}
          style={styles.postVideo}
          useNativeControls
          resizeMode="contain"
          isLooping
        />
      )}
      <View style={styles.postActions}>
        <TouchableOpacity onPress={handleToggleLike} style={styles.actionButton}>
          <Icon name="thumbs-up" size={20} color="#800000" />
          <Text style={styles.actionText}>{post.like_count || 0}</Text>
          <Text style={styles.actionText}>Likes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleViewLikes} style={styles.actionButton}>
          <Text style={styles.actionText}>View Likers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCommentPress} style={styles.actionButton}>
          <Icon name="comment" size={20} color="#800000" />
          <Text style={styles.iconText}>{post.comment_count || 0}</Text>
          <Text style={styles.actionText}>Comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  postContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
    width: '100%'
  
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#800000',
  },
  iconText: {
    color: '#800000',
    marginLeft: 3
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 5,
  },
  postText: {
    fontSize: 16,
    marginBottom: 10,
  
  },
  postImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  postVideo: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    color: '#800000',
  },
});

export default PostItem;
