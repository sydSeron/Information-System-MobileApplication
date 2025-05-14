import React, { useState, useEffect } from 'react';
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
  Platform,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditUser({ route, navigation }) {
  const { user } = route.params;
  const [userData, setUserData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    program: '',
    section: '',
    yearLevel: '',
    age: '',
    birthday: '',
    address: '',
    contactNumber: '',
    // Other fields can be added as needed
  });

  useEffect(() => {
    if (user) {
      setUserData({
        fullName: user.fullName || '',
        studentId: user.studentId || '',
        email: user.email || '',
        program: user.program || '',
        section: user.section || '',
        yearLevel: user.yearLevel || '',
        age: user.age || '',
        birthday: user.birthday || '',
        address: user.address || '',
        contactNumber: user.contactNumber || '',
        // Make sure to preserve other fields
        ...user
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!userData.fullName || !userData.email || !userData.studentId) {
        Alert.alert('Error', 'Name, Email, and Student ID are required');
        return;
      }

      // Save the updated user data - Use studentId as the primary key
      const key = userData.studentId;
      
      // Get the original key if it was different (in case studentId was changed)
      const originalKey = user.studentId;
      
      if (originalKey && originalKey !== key) {
        // If studentId changed, remove the old record
        await AsyncStorage.removeItem(originalKey);
      }
      
      // Save updated user data
      await AsyncStorage.setItem(key, JSON.stringify(userData));
      
      // Show alert and navigate immediately instead of waiting for OK press
      Alert.alert('Success', 'User information updated successfully');
      // Navigate back to admin dashboard
      navigation.goBack();
      
      // or use this for guaranteed navigation to AdminDashboard
      // navigation.navigate('AdminDashboard');
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save user information: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>&lt; Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit User</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={userData.fullName}
            onChangeText={(text) => setUserData({ ...userData, fullName: text })}
            placeholder="Enter full name"
          />

          <Text style={styles.label}>Student ID</Text>
          <TextInput
            style={styles.input}
            value={userData.studentId}
            onChangeText={(text) => setUserData({ ...userData, studentId: text })}
            placeholder="Enter student ID"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={userData.email}
            onChangeText={(text) => setUserData({ ...userData, email: text })}
            placeholder="Enter email"
            keyboardType="email-address"
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

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 15,
    paddingBottom: 15,
    paddingHorizontal: 15,
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