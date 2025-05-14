import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ScheduleScreen({ navigation }) {
  const [scheduleData, setScheduleData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newClass, setNewClass] = useState({
    day: '',
    name: '',
    room: '',
    professor: '',
    time: '',
    color: '#FFFFFF',
    attendance: {} // Track attendance by date
  });

  useEffect(() => {
    loadScheduleData();
    
    // Check for classes that should be marked absent and reset daily attendance
    handleAttendanceLogic();
    
    // Set up a timer to check attendance status every minute
    const attendanceTimer = setInterval(() => {
      handleAttendanceLogic();
    }, 60000); // Check every minute
    
    // Clean up timer when component unmounts
    return () => clearInterval(attendanceTimer);
  }, []);
  
  const handleAttendanceLogic = async () => {
    try {
      // First load the current schedule
      const storedSchedule = await AsyncStorage.getItem('scheduleData');
      if (!storedSchedule) return;
      
      const currentSchedule = JSON.parse(storedSchedule);
      let hasUpdates = false;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const todayWeekday = getDayOfWeek(today);
      
      // Reset attendance status if it's from a previous day
      Object.keys(currentSchedule).forEach(day => {
        currentSchedule[day].forEach((classItem, index) => {
          if (!classItem.attendance) {
            currentSchedule[day][index].attendance = {};
            hasUpdates = true;
          }
          
          // Check for old attendance records and reset them
          Object.keys(classItem.attendance).forEach(date => {
            if (date !== todayStr) {
              delete currentSchedule[day][index].attendance[date];
              hasUpdates = true;
            }
          });
          
          // If this class is for today and time is 3+ hours past, mark as absent
          if (day === todayWeekday) {
            const classTime = parseTimeString(classItem.time);
            if (classTime) {
              // Create class time for today
              const classDateTime = new Date(today);
              classDateTime.setHours(classTime.hours);
              classDateTime.setMinutes(classTime.minutes);
              
              // Check if class was more than 3 hours ago and not marked
              const threeHoursLater = new Date(classDateTime);
              threeHoursLater.setHours(threeHoursLater.getHours() + 3);
              
              if (today > threeHoursLater && 
                  !currentSchedule[day][index].attendance[todayStr]) {
                // Mark as absent (false means absent)
                currentSchedule[day][index].attendance[todayStr] = false;
                hasUpdates = true;
                console.log(`Marked ${classItem.name} as absent automatically`);
              }
            }
          }
        });
      });
      
      // Save updates if needed
      if (hasUpdates) {
        await AsyncStorage.setItem('scheduleData', JSON.stringify(currentSchedule));
        setScheduleData(currentSchedule);
      }
    } catch (error) {
      console.error('Error handling attendance logic:', error);
    }
  };
  
  // Helper function to parse time strings like "10:00 AM" or "2:30 PM"
  const parseTimeString = (timeStr) => {
    if (!timeStr) return null;
    
    // Try to match common time formats
    const timeRegex = /(\d+):?(\d+)?\s*(am|pm|AM|PM)?/;
    const match = timeStr.match(timeRegex);
    
    if (!match) return null;
    
    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const period = match[3] ? match[3].toLowerCase() : null;
    
    // Adjust hours for PM if needed
    if (period === 'pm' && hours < 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    }
    
    return { hours, minutes };
  };
  
  // Helper function to get day of week
  const getDayOfWeek = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const loadScheduleData = async () => {
    try {
      const storedSchedule = await AsyncStorage.getItem('scheduleData');
      if (storedSchedule) {
        setScheduleData(JSON.parse(storedSchedule));
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  };

  const handleAddClass = async () => {
    try {
      const classWithAttendance = {
        ...newClass,
        attendance: {} // Initialize empty attendance object
      };
      
      const updatedSchedule = { ...scheduleData };
      if (updatedSchedule[classWithAttendance.day]) {
        updatedSchedule[classWithAttendance.day] = [...updatedSchedule[classWithAttendance.day], classWithAttendance];
      } else {
        updatedSchedule[classWithAttendance.day] = [classWithAttendance];
      }
      
      await AsyncStorage.setItem('scheduleData', JSON.stringify(updatedSchedule));
      setScheduleData(updatedSchedule);
      setModalVisible(false);
      setNewClass({ day: '', name: '', room: '', professor: '', time: '', color: '#FFFFFF', attendance: {} });
    } catch (error) {
      console.error('Error saving class:', error);
    }
  };

  const handleDeleteClass = async (day, classIndex) => {
    try {
      const updatedSchedule = { ...scheduleData };
      updatedSchedule[day] = updatedSchedule[day].filter((_, index) => index !== classIndex);
      
      // Remove the day key if no classes remain
      if (updatedSchedule[day].length === 0) {
        delete updatedSchedule[day];
      }
      
      await AsyncStorage.setItem('scheduleData', JSON.stringify(updatedSchedule));
      setScheduleData(updatedSchedule);
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const toggleAttendance = async (day, classIndex) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const updatedSchedule = { ...scheduleData };
      
      // Initialize attendance object if it doesn't exist
      if (!updatedSchedule[day][classIndex].attendance) {
        updatedSchedule[day][classIndex].attendance = {};
      }
      
      // Set attendance for today to true (present)
      updatedSchedule[day][classIndex].attendance[today] = true;
      
      // Save updated schedule
      await AsyncStorage.setItem('scheduleData', JSON.stringify(updatedSchedule));
      setScheduleData(updatedSchedule);
      
      // Show feedback to user
      alert(`Marked present for ${updatedSchedule[day][classIndex].name}`);
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const getAttendanceStatus = (classItem) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (!classItem.attendance || !classItem.attendance.hasOwnProperty(today)) {
      return "unmarked";
    }
    
    return classItem.attendance[today] ? "present" : "absent";
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Schedule</Text>
      </View>

      {daysOfWeek.map((day, index) => (
        <View key={index} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{day}</Text>
          {scheduleData[day]?.length > 0 ? (
            scheduleData[day].map((classItem, classIndex) => {
              const status = getAttendanceStatus(classItem);
              
              return (
                <View key={classIndex} style={styles.classItem}>
                  <View style={styles.classContent}>
                    <Text style={styles.className}>{classItem.name}</Text>
                    <Text style={styles.classDetails}>
                      {classItem.room} • {classItem.professor}
                    </Text>
                    <Text style={styles.classTime}>{classItem.time}</Text>
                    
                    {status === "present" && (
                      <View style={styles.attendanceIndicator}>
                        <Text style={styles.presentText}>Present Today</Text>
                      </View>
                    )}
                    
                    {status === "absent" && (
                      <View style={styles.attendanceIndicator}>
                        <Text style={styles.absentText}>Marked Absent</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.actionButtons}>
                    {status === "unmarked" && (
                      <TouchableOpacity 
                        style={styles.presentButton}
                        onPress={() => toggleAttendance(day, classIndex)}
                      >
                        <Text style={styles.presentButtonText}>Mark Present</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteClass(day, classIndex)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#D75A4A" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyMessage}>No classes scheduled for {day}</Text>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Class</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Class</Text>
            
            <Text style={styles.inputLabel}>Day</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter day (e.g., Monday)"
              value={newClass.day}
              onChangeText={(text) => setNewClass({ ...newClass, day: text })}
              placeholderTextColor="#666"
            />
            
            <Text style={styles.inputLabel}>Class Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter class name"
              value={newClass.name}
              onChangeText={(text) => setNewClass({ ...newClass, name: text })}
              placeholderTextColor="#666"
            />
            
            <Text style={styles.inputLabel}>Room</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter room number/name"
              value={newClass.room}
              onChangeText={(text) => setNewClass({ ...newClass, room: text })}
              placeholderTextColor="#666"
            />
            
            <Text style={styles.inputLabel}>Professor</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter professor name"
              value={newClass.professor}
              onChangeText={(text) => setNewClass({ ...newClass, professor: text })}
              placeholderTextColor="#666"
            />
            
            <Text style={styles.inputLabel}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter time (e.g., 10:30 AM)"
              value={newClass.time}
              onChangeText={(text) => setNewClass({ ...newClass, time: text })}
              placeholderTextColor="#666"
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={handleAddClass}>
              <Text style={styles.saveButtonText}>Save Class</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
    paddingBottom: 10,
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
  dayContainer: {
    padding: 20,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  classContent: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  classDetails: {
    fontSize: 14,
    color: '#666',
  },
  classTime: {
    fontSize: 14,
    color: '#D75A4A',
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  addButton: {
    backgroundColor: '#D75A4A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#D75A4A',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    width: '100%',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    width: '100%',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  attendanceIndicator: {
    marginTop: 5,
  },
  presentText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  absentText: {
    color: '#D75A4A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presentButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
  },
  presentButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});