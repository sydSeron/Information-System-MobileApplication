import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>EARIST</Text>
        <Text style={styles.subtitle}>Student Portal</Text>
        
        <Text style={styles.instituteName}>
          Eulogio "Amang" Rodriguez Institute of Science and Technology
        </Text>

        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeTitle}>Welcome to EARIST Student Portal</Text>
          <Text style={styles.welcomeText}>
            A center of excellence in trades, business, arts, science,{'\n'}
            and technology education
          </Text>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.missionText}>
          Our Mission: To produce economically productive, self-sufficient,{'\n'}
          and responsible citizens through vocational, technical, and{'\n'}
          scientific training
        </Text>

        <Text style={styles.establishedText}>
          Established through Republic Act No. 6595
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D75A4A',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  instituteName: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  welcomeBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#D75A4A',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    width: '100%',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  missionText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  establishedText: {
    fontSize: 14,
    color: '#666',
  },
});