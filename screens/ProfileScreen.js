import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ navigation, route }) {
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [profileData, setProfileData] = useState({
    studentId: '2023-0001',
    name: route.params?.username || 'Student',
    fullName: '',
    section: '',
    program: 'BS Information Technology', // Used for both program and course
    yearLevel: '3rd Year', // Used for both yearLevel and year
    age: '',
    birthday: '',
    address: '',
    contactNumber: '',
    email: '',
    photo: null
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem('profileData');
      if (storedProfile) {
        setProfileData(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const updatedProfile = { ...profileData, photo: result.assets[0].uri };
      setProfileData(updatedProfile);
      await AsyncStorage.setItem('profileData', JSON.stringify(updatedProfile));
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSaveInfo = async () => {
    try {
      const updatedProfileData = {
        ...profileData,
        course: profileData.program, // Map program to course
        year: profileData.yearLevel // Map yearLevel to year
      };
      await AsyncStorage.setItem('profileData', JSON.stringify(updatedProfileData));
      setInfoModalVisible(false);
      await AsyncStorage.setItem('userName', profileData.fullName);
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.photoContainer} onPress={handlePickImage}>
          {profileData.photo ? (
            <Image source={{ uri: profileData.photo }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={40} color="#666" />
            </View>
          )}
          <View style={styles.editIconContainer}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.studentId}>{profileData.studentId}</Text>
      </View>

      <View style={styles.settingsSection}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#666" />
          <Text style={styles.settingText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setInfoModalVisible(true)}
        >
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.settingText}>Student Information</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>EARIST Student Portal v1.0.0</Text>
      <Text style={styles.copyright}>© 2023 Eulogio "Amang" Rodriguez Institute of Science and Technology</Text>

      <Modal
        animationType="slide"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Student Information</Text>
              <TouchableOpacity onPress={() => setInfoModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Student Number</Text>
              <TextInput
                style={styles.input}
                value={profileData.studentId}
                onChangeText={(text) => setProfileData({...profileData, studentId: text})}
                placeholder="Enter student number"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={profileData.fullName}
                onChangeText={(text) => setProfileData({...profileData, fullName: text, name: text})}
                placeholder="Enter full name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Section</Text>
              <TextInput
                style={styles.input}
                value={profileData.section}
                onChangeText={(text) => setProfileData({...profileData, section: text})}
                placeholder="Enter section"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Program</Text>
              <TextInput
                style={styles.input}
                value={profileData.program}
                onChangeText={(text) => setProfileData({...profileData, program: text})}
                placeholder="Enter program"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Year Level</Text>
              <TextInput
                style={styles.input}
                value={profileData.yearLevel}
                onChangeText={(text) => setProfileData({...profileData, yearLevel: text})}
                placeholder="Enter year level"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                value={profileData.age}
                onChangeText={(text) => setProfileData({...profileData, age: text})}
                placeholder="Enter age"
                keyboardType="numeric"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Birthday</Text>
              <TextInput
                style={styles.input}
                value={profileData.birthday}
                onChangeText={(text) => setProfileData({...profileData, birthday: text})}
                placeholder="Enter birthday (MM/DD/YYYY)"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={profileData.address}
                onChangeText={(text) => setProfileData({...profileData, address: text})}
                placeholder="Enter address"
                multiline
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Number</Text>
              <TextInput
                style={styles.input}
                value={profileData.contactNumber}
                onChangeText={(text) => setProfileData({...profileData, contactNumber: text})}
                placeholder="Enter contact number"
                keyboardType="phone-pad"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={profileData.email}
                onChangeText={(text) => setProfileData({...profileData, email: text})}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveInfo}
            >
              <Text style={styles.saveButtonText}>Save Information</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.creditsTitle}>Developers</Text>
            <Text style={styles.creditsText}>Maria Liane Badocdoc</Text>
            <Text style={styles.creditsText}>Julius Lucio</Text>
            <Text style={styles.creditsText}>Johnkyle Panta</Text>
            <Text style={styles.creditsText}>Jan Emman Seron</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#D75A4A',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  studentId: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  settingsSection: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#D75A4A',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
  copyright: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#D75A4A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  creditsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  creditsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
});