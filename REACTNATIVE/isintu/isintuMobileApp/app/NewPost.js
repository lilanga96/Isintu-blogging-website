import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { PostsContext } from './PostsContext';
import { supabase } from './apiService';

const NewPost = () => {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const navigation = useNavigation();
  const { addPost } = useContext(PostsContext);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newVideos = result.assets.map(asset => asset.uri);
      setVideos([...videos, ...newVideos]);
    }
  };

  const uploadToStorage = async (fileUri, fileName, folder) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist.');
      }

      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data, error } = await supabase.storage
        .from(folder)
        .upload(fileName, fileContent, {
          cacheControl: '3600',
          upsert: false,
          contentType: folder === 'post-images' ? 'image/jpeg' : 'video/mp4',
        });

      if (error) throw error;

      return data.path;
    } catch (error) {
      console.error("Storage Upload Error:", error.message);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: roleData, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (roleError) throw roleError;
      const role = roleData.role;

      const imagePaths = await Promise.all(images.map(async (imageUri, index) => {
        const fileName = `images/${Date.now()}_${index}.jpg`;
        return await uploadToStorage(imageUri, fileName, 'post-images');
      }));

      const videoPaths = await Promise.all(videos.map(async (videoUri, index) => {
        const fileName = `videos/${Date.now()}_${index}.mp4`;
        return await uploadToStorage(videoUri, fileName, 'post-videos');
      }));

      const postData = {
        text,
        image: imagePaths.length ? imagePaths : null,
        video: videoPaths.length ? videoPaths : null,
        status: role === 'admin' ? 'published' : 'pending',
      };

      const { data: insertData, error } = await supabase
        .from('posts')
        .insert([postData]);

      if (error) throw error;

      if (role === 'admin') {
        // Notify all users when an admin publishes a post
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id');

        if (usersError) throw usersError;

        const notifications = users.map((profile) => ({
          user_id: profile.id,
          message: `New post by Admin: ${text}`,
          status: 'unread',
        }));

        const { error: notifyError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notifyError) throw notifyError;

        Alert.alert('Post Published', 'Your post has been published and users have been notified.');
      } else {
        Alert.alert('Post Submitted', 'Your post is awaiting admin approval.');
      }

      addPost(postData);
      navigation.goBack();
    } catch (error) {
      console.error('Catch error:', error);
      Alert.alert('Error', error.message || 'An unknown error occurred');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Write your post here..."
        multiline
        value={text}
        onChangeText={setText}
      />
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Icon name="image" size={20} color="#fff" />
        <Text style={styles.buttonText}>Add Images</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <ScrollView horizontal>
          {images.map((imageUri, index) => (
            <Image key={index} source={{ uri: imageUri }} style={styles.image} />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.button} onPress={pickVideo}>
        <Icon name="video-camera" size={20} color="#fff" />
        <Text style={styles.buttonText}>Add Videos</Text>
      </TouchableOpacity>

      {videos.length > 0 && (
        <ScrollView horizontal>
          {videos.map((videoUri, index) => (
            <Text key={index} style={styles.videoText}>Video {index + 1}</Text>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Icon name="send" size={20} color="#fff" />
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>
    </ScrollView>
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
    width: 100,
    height: 100,
    marginRight: 10,
  },
  videoText: {
    marginBottom: 20,
    color: '#800000',
  },
});

export default NewPost;
