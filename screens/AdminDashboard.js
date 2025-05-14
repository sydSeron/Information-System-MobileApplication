import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminDashboard({ navigation }) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  // Use the React Navigation focus effect to refresh data when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('AdminDashboard focused - reloading users');
      loadUsers();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const loadAttendanceData = async () => {
      const data = await fetchAttendanceData();
      setAttendanceData(data);
    };
    
    if (activeTab === 'reports') {
      loadAttendanceData();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const allKeys = await AsyncStorage.getAllKeys();
      
      console.log('All AsyncStorage keys:', allKeys);
      
      const userKeys = allKeys.filter(key => 
        !['userToken', 'userName', 'userRole', 'profileData'].includes(key)
      );
      
      console.log('Filtered user keys:', userKeys);
      
      const userList = [];
      for (const key of userKeys) {
        const userData = JSON.parse(await AsyncStorage.getItem(key));
        if (userData && userData.email) { // Ensure it's actually a user account
          userList.push({
            key,
            ...userData
          });
          console.log('Loaded user:', userData.fullName);
        }
      }
      
      setUsers(userList);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load user data');
      setIsLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      // Get all users
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => 
        !['userToken', 'userName', 'userRole', 'profileData'].includes(key) && !key.startsWith('grades_')
      );
      
      // Get schedule data
      const scheduleData = await AsyncStorage.getItem('scheduleData');
      if (!scheduleData) {
        return [];
      }
      
      const parsedSchedule = JSON.parse(scheduleData);
      
      // Process attendance data for reporting
      const attendanceReport = [];
      const today = new Date().toISOString().split('T')[0];
      
      // Process each day in the schedule
      Object.keys(parsedSchedule).forEach(day => {
        parsedSchedule[day].forEach(classItem => {
          if (classItem.attendance) {
            // Get all dates when attendance was tracked
            Object.keys(classItem.attendance).forEach(date => {
              attendanceReport.push({
                date,
                day,
                className: classItem.name,
                professor: classItem.professor,
                time: classItem.time,
                present: classItem.attendance[date],
                isToday: date === today
              });
            });
          }
        });
      });
      
      // Sort by date (newest first)
      return attendanceReport.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      return [];
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userName');
      await AsyncStorage.removeItem('userRole');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await AsyncStorage.removeItem(userId);
      Alert.alert('Success', 'User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => openUserDetails(item)}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.fullName}</Text>
        <Text style={styles.userDetails}>ID: {item.studentId}</Text>
        <Text style={styles.userDetails}>{item.email}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditUser', { user: item })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Confirm Delete',
              `Are you sure you want to delete ${item.fullName}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => deleteUser(item.key), style: 'destructive' }
              ]
            );
          }}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderUserModal = () => (
    <Modal
      visible={isModalVisible && selectedUser !== null}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Student Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailText}>{selectedUser?.fullName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Student ID:</Text>
            <Text style={styles.detailText}>{selectedUser?.studentId}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailText}>{selectedUser?.email}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Program:</Text>
            <Text style={styles.detailText}>{selectedUser?.program}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Section:</Text>
            <Text style={styles.detailText}>{selectedUser?.section}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Year Level:</Text>
            <Text style={styles.detailText}>{selectedUser?.yearLevel}</Text>
          </View>

          <View style={styles.modalButtonsRow}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setIsModalVisible(false);
                navigation.navigate('EditUser', { user: selectedUser });
              }}
            >
              <Text style={styles.modalButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setIsModalVisible(false);
                navigation.navigate('ManageGrades', { user: selectedUser });
              }}
            >
              <Text style={styles.modalButtonText}>Manage Grades</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>Attendance Tracking</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'users' && (
        <View style={styles.content}>
          <View style={styles.actionBar}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddUser')}
            >
              <Text style={styles.addButtonText}>+ Add New User</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadUsers}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading users...</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.key || item.email}
              style={styles.list}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyText}>No registered users found</Text>
                </View>
              }
            />
          )}
        </View>
      )}

      {activeTab === 'reports' && (
        <View style={styles.content}>
          
          <View style={styles.reportSection}>
            <Text style={styles.reportSubtitle}>Class Attendance</Text>
            
            {attendanceData.length > 0 ? (
              <FlatList
                data={attendanceData}
                keyExtractor={(item, index) => `attendance-${index}`}
                renderItem={({ item }) => (
                  <View style={[
                    styles.attendanceItem, 
                    item.present ? styles.presentClass : styles.absentClass
                  ]}>
                    <View>
                      <Text style={styles.attendanceClass}>{item.className}</Text>
                      <Text style={styles.attendanceDetails}>
                        {item.day} • {item.time} • {item.professor}
                      </Text>
                      <Text style={styles.attendanceDate}>
                        {new Date(item.date).toLocaleDateString()} 
                        {item.isToday ? ' (Today)' : ''}
                      </Text>
                    </View>
                    <View style={styles.attendanceStatus}>
                      <Text style={item.present ? styles.presentText : styles.absentText}>
                        {item.present ? 'Present' : 'Absent'}
                      </Text>
                    </View>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.emptyReportText}>No attendance data available yet.</Text>
            )}
          </View>
        </View>
      )}

      {renderUserModal()}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#D75A4A',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#D75A4A',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#D75A4A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  refreshButtonText: {
    color: '#666',
  },
  list: {
    flex: 1,
  },
  userItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userDetails: {
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#4A90E2',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#E25A4A',
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: '35%',
  },
  detailText: {
    flex: 1,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#D75A4A',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 0.48,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  placeholderText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  reportSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  reportSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  presentClass: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  absentClass: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#D75A4A',
  },
  attendanceClass: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  attendanceDetails: {
    fontSize: 14,
    color: '#666',
  },
  attendanceDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  attendanceStatus: {
    justifyContent: 'center',
  },
  presentText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  absentText: {
    color: '#D75A4A',
    fontWeight: 'bold',
  },
  emptyReportText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
});