import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // Check for hardcoded admin account
      if (username === 'Admin123' && password === 'CCS2025') {
        await AsyncStorage.setItem('userToken', 'loggedIn');
        await AsyncStorage.setItem('userName', 'Administrator');
        await AsyncStorage.setItem('userRole', 'admin'); // Add this line to store the role
        
        // Store admin profile data
        const adminProfileData = {
          studentId: 'ADMIN-2025',
          name: 'Administrator',
          fullName: 'Administrator',
          section: 'Admin',
          program: 'Computer Science',
          yearLevel: 'Admin',
          age: '',
          birthday: '',
          address: 'EARIST Manila',
          contactNumber: '',
          email: 'admin@earist.edu.ph',
          photo: null
        };

        await AsyncStorage.setItem('profileData', JSON.stringify(adminProfileData));
        
        // Change this line to navigate to AdminDashboard instead of Dashboard
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminDashboard' }],
        });
        return;
      }

      // Regular user login logic
      let storedUser = await AsyncStorage.getItem(username);
      if (!storedUser) {
        // If not found by username, try searching by email
        const allKeys = await AsyncStorage.getAllKeys();
        for (const key of allKeys) {
          const user = await AsyncStorage.getItem(key);
          if (user) {
            const userData = JSON.parse(user);
            if (userData.email === username) {
              storedUser = user;
              break;
            }
          }
        }
      }

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.password === password) {
          // Login successful
          await AsyncStorage.setItem('userToken', 'loggedIn');
          await AsyncStorage.setItem('userName', userData.fullName);
          
          // Store all user profile data
          const profileData = {
            studentId: userData.studentId,
            name: userData.fullName,
            fullName: userData.fullName,
            section: userData.section,
            program: userData.program,
            yearLevel: userData.yearLevel,
            age: userData.age,
            birthday: userData.birthday,
            address: userData.address,
            contactNumber: userData.contactNumber,
            email: userData.email,
            course: userData.course,
            year: userData.year,
            photo: userData.photo || null
          };

          // Save complete profile data
          await AsyncStorage.setItem('profileData', JSON.stringify(profileData));

          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          });
        } else {
          Alert.alert('Login Failed', 'Invalid password');
        }
      } else {
        Alert.alert('Login Failed', 'User not found');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Login Failed', 'An error occurred during login.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backButtonText}>⬅ Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Student Login</Text>
          <Text style={styles.subtitle}>Sign in to access your student portal</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email or Student ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email or student ID"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Text>{showPassword ? '👁' : '👁‍🗨'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rememberContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkboxInner, rememberMe && styles.checked]} />
              </TouchableOpacity>
              <Text style={styles.rememberText}>Remember me</Text>
            </View>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleLogin}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.createAccountText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.supportText}>
            For technical assistance, contact Administrator.
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    paddingTop: 30, // Adds space from the top of the screen
    paddingHorizontal: 2,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10, // Increases touch target size
    width: 100, // Makes button wider and easier to press
  },
  backButtonText: {
    fontSize: 17,
    color: '#D75A4A', // Matches your theme color
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D75A4A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#D75A4A',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  checked: {
    backgroundColor: '#D75A4A',
  },
  rememberText: {
    flex: 1,
  },
  forgotPassword: {
    color: '#D75A4A',
  },
  signInButton: {
    backgroundColor: '#D75A4A',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 30,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  createAccountText: {
    color: '#D75A4A',
    textAlign: 'center',
    marginTop: 20,
  },
});