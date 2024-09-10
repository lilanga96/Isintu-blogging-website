import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { PostsContext } from './PostsContext';
import { supabase } from './apiService';


const NewPost = () => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const navigation = useNavigation();
  const { addPost } = useContext(PostsContext);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); 
    }
  };

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideo(result.assets[0].uri); 
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
  
      // Fetch user role from the database
      const { data: roleData, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
  
      if (roleError) throw roleError;
  
      const role = roleData.role;
  
      // If the user is an admin, publish the post immediately
      if (role === 'admin') {
        const { data, error } = await supabase
          .from('posts')
          .insert([{ text, image, video, status: 'published' }]); // Ensure 'published' status
  
        if (error) throw error;
  
        addPost({ text, image, video, status: 'published' }); // Update context or state
      } else {
        // For standard users, send the post to 'newRequests' tab for approval
        const { data, error } = await supabase
          .from('posts')
          .insert([{ text, image, video, status: 'pending' }]); // 'pending' status for admin approval
  
        if (error) throw error;
  
        alert('Post Submitted', 'Your post is awaiting admin approval.');
      }
  
      navigation.goBack();
    } catch (error) {
      console.error('Catch error:', error);
      alert('Error', error.message || 'An unknown error occurred');
    }
  };
  
  

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Write your post here..."
        multiline
        value={text}
        onChangeText={setText}
      />
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Icon name="image" size={20} color="#fff" />
        <Text style={styles.buttonText}>Add Image</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <TouchableOpacity style={styles.button} onPress={pickVideo}>
        <Icon name="video-camera" size={20} color="#fff" />
        <Text style={styles.buttonText}>Add Video</Text>
      </TouchableOpacity>
      {video && <Text style={styles.videoText}>Video added!</Text>}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Icon name="send" size={20} color="#fff" />
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  input: {
    height: 150,
    borderColor: '#800000',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    textAlignVertical: 'top',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#800000',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  videoText: {
    marginBottom: 20,
  },
});

export default NewPost;