import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddUser({ navigation }) {
  const [userData, setUserData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    program: '',
    section: '',
    yearLevel: '',
    age: '',
    birthday: '',
    address: '',
    contactNumber: '',
    photo: null
  });

  const validateForm = () => {
    if (!userData.fullName) {
      Alert.alert('Error', 'Full name is required');
      return false;
    }
    if (!userData.studentId) {
      Alert.alert('Error', 'Student ID is required');
      return false;
    }
    if (!userData.email) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!userData.password) {
      Alert.alert('Error', 'Password is required');
      return false;
    }
    if (userData.password !== userData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      // Validate form
      if (!validateForm()) return;

      // Check if student ID or email already exists
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Filter out non-user keys first to avoid parsing system keys
      const userKeys = allKeys.filter(key => 
        !['userToken', 'userName', 'userRole', 'profileData'].includes(key)
      );
      
      for (const key of userKeys) {
        // Skip if this is a system key
        if (key === userData.studentId) {
          Alert.alert('Error', 'Student ID already exists');
          return;
        }
        
        try {
          const existingUserStr = await AsyncStorage.getItem(key);
          if (existingUserStr) {
            // Validate JSON before parsing
            if (existingUserStr.startsWith('{')) {
              const existingUser = JSON.parse(existingUserStr);
              if (existingUser && existingUser.email === userData.email) {
                Alert.alert('Error', 'Email already exists');
                return;
              }
            }
          }
        } catch (parseError) {
          console.log(`Skipping invalid user data for key: ${key}`);
          // Continue checking other keys instead of failing
        }
      }

      // Save new user
      await AsyncStorage.setItem(userData.studentId, JSON.stringify(userData));
      
      Alert.alert(
        'Success', 
        'User created successfully',
        [{ text: 'OK', onPress: () => navigation.navigate('AdminDashboard') }]
      );
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>&lt; Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New User</Text>
        <View style={{ width: 50 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.formContainer}
          contentContainerStyle={styles.formContentContainer}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={userData.fullName}
            onChangeText={(text) => setUserData({ ...userData, fullName: text })}
            placeholder="Enter full name"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Student ID *</Text>
          <TextInput
            style={styles.input}
            value={userData.studentId}
            onChangeText={(text) => setUserData({ ...userData, studentId: text })}
            placeholder="Enter student ID"
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={userData.email}
            onChangeText={(text) => setUserData({ ...userData, email: text })}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            value={userData.password}
            onChangeText={(text) => setUserData({ ...userData, password: text })}
            placeholder="Enter password"
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={styles.input}
            value={userData.confirmPassword}
            onChangeText={(text) => setUserData({ ...userData, confirmPassword: text })}
            placeholder="Confirm password"
            secureTextEntry
          />

          <Text style={styles.sectionTitle}>Academic Information</Text>
          
          <Text style={styles.label}>Program</Text>
          <TextInput
            style={styles.input}
            value={userData.program}
            onChangeText={(text) => setUserData({ ...userData, program: text })}
            placeholder="Enter program/course"
          />

          <Text style={styles.label}>Section</Text>
          <TextInput
            style={styles.input}
            value={userData.section}
            onChangeText={(text) => setUserData({ ...userData, section: text })}
            placeholder="Enter section"
          />

          <Text style={styles.label}>Year Level</Text>
          <TextInput
            style={styles.input}
            value={userData.yearLevel}
            onChangeText={(text) => setUserData({ ...userData, yearLevel: text })}
            placeholder="Enter year level"
          />

          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={userData.age}
            onChangeText={(text) => setUserData({ ...userData, age: text })}
            placeholder="Enter age"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Birthday</Text>
          <TextInput
            style={styles.input}
            value={userData.birthday}
            onChangeText={(text) => setUserData({ ...userData, birthday: text })}
            placeholder="Enter birthday (MM/DD/YYYY)"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={userData.address}
            onChangeText={(text) => setUserData({ ...userData, address: text })}
            placeholder="Enter address"
            multiline
          />

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            value={userData.contactNumber}
            onChangeText={(text) => setUserData({ ...userData, contactNumber: text })}
            placeholder="Enter contact number"
            keyboardType="phone-pad"
          />

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Create User</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#D75A4A',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    padding: 20,
  },
  formContentContainer: {
    paddingBottom: 30, // Extra padding at the bottom for better scrolling
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#D75A4A',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});