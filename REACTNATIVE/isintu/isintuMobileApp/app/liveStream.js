import { React }from 'react';
import { View, Text, StyleSheet,  } from 'react-native';


const LiveStream = () => {
 
     
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Live Stream</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#800000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginBottom: 20,
  },
  endButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LiveStream;
