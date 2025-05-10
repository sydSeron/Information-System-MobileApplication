import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const assignmentTypes = ['All Assignments', 'Pending', 'In Progress', 'Completed'];

export default function HomeworkScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('All Assignments');
  const [homeworkData, setHomeworkData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHomework, setNewHomework] = useState({
    title: '',
    subject: '',
    dueDate: '',
    status: 'Pending',
    description: '',
    type: ''
  });

  useEffect(() => {
    loadHomeworkData();
  }, []);

  const loadHomeworkData = async () => {
    try {
      const storedHomework = await AsyncStorage.getItem('homeworkData');
      if (storedHomework) {
        setHomeworkData(JSON.parse(storedHomework));
      }
    } catch (error) {
      console.error('Error loading homework:', error);
    }
  };

  const handleAddHomework = async () => {
    try {
      const updatedHomework = [...homeworkData, { ...newHomework, id: Date.now() }];
      await AsyncStorage.setItem('homeworkData', JSON.stringify(updatedHomework));
      setHomeworkData(updatedHomework);
      setModalVisible(false);
      setNewHomework({
        title: '',
        subject: '',
        dueDate: '',
        status: 'Pending',
        description: '',
        type: ''
      });
    } catch (error) {
      console.error('Error saving homework:', error);
    }
  };

  const handleDeleteHomework = async (id) => {
    try {
      const updatedHomework = homeworkData.filter(item => item.id !== id);
      await AsyncStorage.setItem('homeworkData', JSON.stringify(updatedHomework));
      setHomeworkData(updatedHomework);
    } catch (error) {
      console.error('Error deleting homework:', error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const updatedHomework = homeworkData.map(item => {
        if (item.id === id) {
          const newStatus = item.status === 'Completed' ? 'Pending' : 'Completed';
          return { ...item, status: newStatus };
        }
        return item;
      });
      await AsyncStorage.setItem('homeworkData', JSON.stringify(updatedHomework));
      setHomeworkData(updatedHomework);
    } catch (error) {
      console.error('Error updating homework status:', error);
    }
  };

  const filteredHomework = homeworkData.filter(homework => {
    if (activeTab === 'All Assignments') return true;
    return homework.status === activeTab;
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Homework & Assignments</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
      >
        {assignmentTypes.map((type, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              activeTab === type && styles.activeTab
            ]}
            onPress={() => setActiveTab(type)}
          >
            <Text style={[
              styles.tabText,
              activeTab === type && styles.activeTabText
            ]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredHomework.map((homework, index) => (
        <View key={homework.id || index} style={styles.homeworkItem}>
          <View style={styles.homeworkContent}>
            <View style={styles.homeworkHeader}>
              <Text style={styles.homeworkTitle}>{homework.title}</Text>
              <View style={[styles.statusBadge, { 
                backgroundColor: 
                  homework.status === 'Completed' ? '#4CAF50' :
                  homework.status === 'In Progress' ? '#2196F3' : '#FFC107'
              }]}>
                <Text style={styles.statusText}>{homework.status}</Text>
              </View>
            </View>
            <Text style={styles.homeworkSubject}>{homework.subject}</Text>
            <Text style={styles.homeworkDescription}>{homework.description}</Text>
            <Text style={styles.dueDate}>Due: {homework.dueDate}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleStatus(homework.id)}
            >
              <Ionicons 
                name={homework.status === 'Completed' ? "refresh-outline" : "checkmark-outline"} 
                size={24} 
                color={homework.status === 'Completed' ? "#666" : "#4CAF50"} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteHomework(homework.id)}
            >
              <Ionicons name="trash-outline" size={24} color="#D75A4A" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Assignment</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Assignment</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newHomework.title}
              onChangeText={(text) => setNewHomework({ ...newHomework, title: text })}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={newHomework.subject}
              onChangeText={(text) => setNewHomework({ ...newHomework, subject: text })}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Due Date (e.g., Oct 20, 2023)"
              value={newHomework.dueDate}
              onChangeText={(text) => setNewHomework({ ...newHomework, dueDate: text })}
              placeholderTextColor="#666"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              multiline
              numberOfLines={4}
              value={newHomework.description}
              onChangeText={(text) => setNewHomework({ ...newHomework, description: text })}
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddHomework}>
              <Text style={styles.saveButtonText}>Save Assignment</Text>
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
  tabContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  activeTab: {
    backgroundColor: '#D75A4A',
  },
  tabText: {
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  homeworkItem: {
    flexDirection: 'row',
    padding: 15,
    margin: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
  },
  homeworkContent: {
    flex: 1,
  },
  homeworkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  homeworkTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  homeworkSubject: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  homeworkDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dueDate: {
    fontSize: 14,
    color: '#D75A4A',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },
  actionButton: {
    padding: 5,
    marginVertical: 2,
  },
  addButton: {
    backgroundColor: '#D75A4A',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
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
      height: 2
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
    color: '#333',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#D75A4A',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});