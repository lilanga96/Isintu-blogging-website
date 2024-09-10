import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    { id: '1', message: 'New follower: John Doe', date: '2024-08-27' },
    { id: '2', message: 'Your post received a like', date: '2024-08-26' },
    // Add more notifications here
  ]);

  const navigation = useNavigation();

  useEffect(() => {
    // Fetch notifications from an API or other data source here
    // Example:
    // fetchNotifications().then(data => setNotifications(data));
  }, []);

  const handleNotificationPress = (notification) => {
    Alert.alert('Notification', notification.message);
    // You can navigate to a detailed view or perform other actions here
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.notificationItem} onPress={() => handleNotificationPress(item)}>
      <View style={styles.notificationContent}>
        <Icon name="bell" size={20} color="#800000" style={styles.notificationIcon} />
        <View style={styles.notificationText}>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationDate}>{item.date}</Text>
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
