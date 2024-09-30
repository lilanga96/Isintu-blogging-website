import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './apiService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        console.log('Fetched User:', user); 
        if (user) {
          setUserId(user.id);
        } else {
          console.error('No user found');
        }
      } catch (error) {
        console.error('Error fetching user:', error.message);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) {
      console.log('User ID is not available yet'); 
      return;
    }

    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications for user ID:', userId); 
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        console.log('Fetched notifications:', data); 
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error.message);
      }
    };

    fetchNotifications();
  }, [userId]);

  const handleNotificationPress = (notification) => {
    Alert.alert('Notification', notification.message);
    // Optionally mark notification as read
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.notificationItem} onPress={() => handleNotificationPress(item)}>
      <View style={styles.notificationContent}>
        <Icon name="bell" size={20} color="#800000" style={styles.notificationIcon} />
        <View style={styles.notificationText}>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationDate}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Notifications</Text>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 10,
  },
  notificationText: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#000',
  },
  notificationDate: {
    fontSize: 14,
    color: '#777',
  },
});

export default Notifications;
