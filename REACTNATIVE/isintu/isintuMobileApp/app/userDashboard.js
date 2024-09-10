import React, { useContext, useEffect , useState} from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { PostsContext } from './PostsContext';
import PostItem from './PostItem';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { supabase } from './apiService'; 
import { useFocusEffect } from '@react-navigation/native';

const UserDashboard = () => {
  const navigation = useNavigation();
  const { posts, setPosts } = useContext(PostsContext);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // Fetch the admin data (Isintu Siyabukwa) based on username or email
    const fetchAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('full_name', 'siphesihle')
          .single();
          
        if (error) throw error;
        setAdmin(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch admin data');
      }
    };

    fetchAdmin();
  }, []);

  const handleFollow = async () => {
    try {
      // Fetch the current session/user details asynchronously
      const { data: { user }, error: userError } = await supabase.auth.getUser();
  
      if (userError || !user) {
        Alert.alert('Error', 'User not found. Please log in.');
        return;
      }
  
      if (!admin) {
        Alert.alert('Error', 'Admin not found.');
        return;
      }
  
      console.log('User ID:', user.id);
      console.log('Admin ID:', admin.id);
  
      const { data, error } = await supabase
        .from('followers')
        .insert([{ follower_id: user.id, followed_id: admin.id }]);
  
      if (error) {
        console.error('Supabase Error:', error.message);
        throw error;
      }
  
      Alert.alert('Success', 'You are now following Isintu Siyabukwa');
    } catch (error) {
      console.error('Error:', error.message);
      Alert.alert('Error', 'Failed to follow admin');
    }
  };
  
  
  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [])
  );


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
  const renderPost = ({ item, index }) => {
    return <PostItem post={item} index={index} />;
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
  
  
  
  <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
    <Icon name="bell" size={28} color="#800000" />
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
  followButton: {
    backgroundColor: '#800000',
    padding: 15,
    borderRadius: 5,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UserDashboard;