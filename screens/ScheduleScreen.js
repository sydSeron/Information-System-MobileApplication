import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ScheduleScreen({ navigation }) {
  const [week, setWeek] = useState(0);
  const [scheduleData, setScheduleData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newClass, setNewClass] = useState({
    day: '',
    name: '',
    room: '',
    professor: '',
    time: '',
    color: '#FFFFFF',
  });

  const weekLabels = {
    '-1': 'Last Week',
    '0': 'This Week',
    '1': 'Next Week',
  };

  useEffect(() => {
    loadScheduleData();
  }, []);

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

  const changeWeek = (direction) => {
    setWeek((prevWeek) => prevWeek + direction);
  };

  const handleAddClass = async () => {
    try {
      const updatedSchedule = { ...scheduleData };
      if (updatedSchedule[newClass.day]) {
        updatedSchedule[newClass.day] = [...updatedSchedule[newClass.day], newClass];
      } else {
        updatedSchedule[newClass.day] = [newClass];
      }
      
      await AsyncStorage.setItem('scheduleData', JSON.stringify(updatedSchedule));
      setScheduleData(updatedSchedule);
      setModalVisible(false);
      setNewClass({ day: '', name: '', room: '', professor: '', time: '', color: '#FFFFFF' });
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Schedule</Text>
      </View>

      <View style={styles.weekSelector}>
        <TouchableOpacity onPress={() => changeWeek(-1)}>
          <Ionicons name="chevron-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.weekText}>{weekLabels[week] || 'Unknown Week'}</Text>
        <TouchableOpacity onPress={() => changeWeek(1)}>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {daysOfWeek.map((day, index) => (
        <View key={index} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{day}</Text>
          {scheduleData[day] && scheduleData[day].map((classItem, classIndex) => (
            <View key={classIndex} style={styles.classItem}>
              <View style={styles.classContent}>
                <Text style={styles.className}>{classItem.name}</Text>
                <Text style={styles.classDetails}>
                  {classItem.room} • {classItem.professor}
                </Text>
                <Text style={styles.classTime}>{classItem.time}</Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteClass(day, classIndex)}
              >
                <Ionicons name="trash-outline" size={20} color="#D75A4A" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Class</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Class</Text>
            <TextInput
              style={styles.input}
              placeholder="Day"
              value={newClass.day}
              onChangeText={(text) => setNewClass({ ...newClass, day: text })}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Class Name"
              value={newClass.name}
              onChangeText={(text) => setNewClass({ ...newClass, name: text })}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Room"
              value={newClass.room}
              onChangeText={(text) => setNewClass({ ...newClass, room: text })}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Professor"
              value={newClass.professor}
              onChangeText={(text) => setNewClass({ ...newClass, professor: text })}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Time"
              value={newClass.time}
              onChangeText={(text) => setNewClass({ ...newClass, time: text })}
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddClass}>
              <Text style={styles.saveButtonText}>Save Class</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(!modalVisible)}
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
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  weekText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
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
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#D75A4A',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
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
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});