import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [section, setSection] = useState('');
  const [program, setProgram] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [age, setAge] = useState('');
  const [birthday, setBirthday] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!studentId || !fullName || !password) {
      Alert.alert('Registration Failed', 'Please fill in all required fields.');
      return;
    }

    try {
      // Store user data in AsyncStorage
      const userData = {
        studentId,
        fullName,
        section,
        program,
        yearLevel,
        age,
        birthday,
        address,
        contactNumber,
        email,
        course: program, // Use program as course
        year: yearLevel, // Use yearLevel as year
        password,
      };

      await AsyncStorage.setItem(studentId, JSON.stringify(userData));
      Alert.alert('Registration Successful', 'Your account has been created.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Registration Failed', 'An error occurred during registration.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Fill in the details to register</Text>

        <TextInput
          style={styles.input}
          placeholder="Student ID"
          value={studentId}
          onChangeText={setStudentId}
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Section"
          value={section}
          onChangeText={setSection}
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Program"
          value={program}
          onChangeText={setProgram}
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Year Level"
          value={yearLevel}
          onChangeText={setYearLevel}
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Birthday (MM/DD/YYYY)"
          value={birthday}
          onChangeText={setBirthday}
          placeholderTextColor="#666"
        />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          multiline
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666"
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLink}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000', // Add this to make input text black
    placeholderTextColor: '#666', // Add this to make placeholder text gray
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#D75A4A',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    marginBottom: 20,
  },
  loginLink: {
    color: '#D75A4A',
    fontSize: 16,
  },
});