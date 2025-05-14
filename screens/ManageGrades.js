import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ManageGrades({ route, navigation }) {
  const { user } = route.params;
  const [grades, setGrades] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentGrade, setCurrentGrade] = useState({ 
    code: '',
    name: '', 
    professor: '',
    grade: '',
    type: 'Midterm',
    semester: 'current'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    loadGrades();
  }, []);

  useEffect(() => {
    // Migrate old data structure to new one if needed
    const migrateData = async () => {
      if (grades.length > 0) {
        const needsMigration = grades.some(grade => 
          grade.subject && !grade.name || !grade.semester
        );
        
        if (needsMigration) {
          console.log('Migrating grades data to new structure');
          const migratedGrades = grades.map(grade => ({
            id: grade.id || Date.now().toString(),
            code: grade.code || '',
            name: grade.name || grade.subject || '',
            professor: grade.professor || '',
            grade: grade.grade || '',
            type: grade.type || grade.term || 'Midterm',
            semester: grade.semester || 'current'
          }));
          
          await saveGrades(migratedGrades);
        }
      }
    };
    
    migrateData();
  }, [grades]);

  const loadGrades = async () => {
    try {
      const gradesKey = `grades_${user.studentId}`;
      const storedGrades = await AsyncStorage.getItem(gradesKey);
      
      if (storedGrades) {
        const parsedGrades = JSON.parse(storedGrades);
        
        // Ensure all grades have IDs
        const validatedGrades = parsedGrades.map((grade, index) => {
          if (!grade.id) {
            console.log(`Adding missing ID to grade at index ${index}`);
            return { ...grade, id: `grade-${index}-${Date.now()}` };
          }
          return grade;
        });
        
        // Save back if any IDs were added
        if (JSON.stringify(parsedGrades) !== JSON.stringify(validatedGrades)) {
          console.log('Saving grades with fixed IDs');
          await AsyncStorage.setItem(gradesKey, JSON.stringify(validatedGrades));
        }
        
        setGrades(validatedGrades);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
      Alert.alert('Error', 'Failed to load grades');
    }
  };

  const saveGrades = async (updatedGrades) => {
    try {
      const gradesKey = `grades_${user.studentId}`;
      await AsyncStorage.setItem(gradesKey, JSON.stringify(updatedGrades));
      setGrades(updatedGrades);
    } catch (error) {
      console.error('Error saving grades:', error);
      Alert.alert('Error', 'Failed to save grades');
    }
  };

  const addGrade = () => {
    if (!currentGrade.name || !currentGrade.grade) {
      Alert.alert('Error', 'Subject name and grade are required');
      return;
    }

    const newGrade = {
      ...currentGrade,
      id: Date.now().toString()
    };

    if (isEditing) {
      // Update existing grade
      const updatedGrades = [...grades];
      updatedGrades[editIndex] = newGrade;
      saveGrades(updatedGrades);
    } else {
      // Add new grade
      saveGrades([...grades, newGrade]);
    }

    setModalVisible(false);
    resetGradeForm();
  };

  const deleteGrade = (id) => {
    // Ensure id is a string for consistent comparison
    const targetId = String(id);
    
    Alert.alert(
      'Delete Grade',
      'Are you sure you want to delete this grade?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Create a new array without the grade to delete
              const updatedGrades = grades.filter(grade => 
                String(grade.id) !== targetId
              );
              
              // Check if any grade was removed
              if (grades.length === updatedGrades.length) {
                Alert.alert('Warning', 'The grade could not be found.');
                return;
              }
              
              // Save the updated grades
              await saveGrades(updatedGrades);
              
              // Force a refresh of the UI (setting state directly)
              setGrades(updatedGrades);
              
              // Show success message
              Alert.alert('Success', 'Grade deleted successfully');
            } catch (error) {
              console.error('Error deleting grade:', error);
              Alert.alert('Error', 'Failed to delete grade');
            }
          }
        }
      ]
    );
  };

  const editGrade = (index) => {
    setIsEditing(true);
    setEditIndex(index);
    setCurrentGrade(grades[index]);
    setModalVisible(true);
  };

  const resetGradeForm = () => {
    setCurrentGrade({ 
      code: '',
      name: '', 
      professor: '',
      grade: '',
      type: 'Midterm',
      semester: 'current'
    });
    setIsEditing(false);
    setEditIndex(-1);
  };

  const renderItem = ({ item, index }) => {
    // Ensure each item has a proper ID for deletion
    const itemId = item.id || `grade-${index}-${Date.now()}`;
    
    return (
      <View style={styles.gradeItem}>
        <View style={styles.gradeInfo}>
          <Text style={styles.subject}>{item.name || item.subject}</Text>
          <Text style={styles.subjectCode}>{item.code} • {item.professor}</Text>
          <Text style={styles.termText}>{item.type || item.term} • {item.semester === 'current' ? 'Current Semester' : 'Previous Semester'}</Text>
          <Text style={styles.gradeText}>Grade: {item.grade}</Text>
        </View>
        <View style={styles.gradeActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => editGrade(index)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteGrade(itemId)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>&lt; Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Grades</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.studentInfoContainer}>
        <Text style={styles.studentName}>{user.fullName}</Text>
        <Text style={styles.studentDetails}>ID: {user.studentId}</Text>
        <Text style={styles.studentDetails}>{user.program} - {user.yearLevel}</Text>
      </View>

      <TouchableOpacity 
        style={styles.addGradeButton}
        onPress={() => {
          resetGradeForm();
          setModalVisible(true);
        }}
      >
        <Text style={styles.addGradeButtonText}>+ Add New Grade</Text>
      </TouchableOpacity>

      <FlatList
        data={grades}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.gradesList}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>No grades recorded yet</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Grade' : 'Add New Grade'}
            </Text>

            <Text style={styles.label}>Course Code</Text>
            <TextInput
              style={styles.input}
              value={currentGrade.code}
              onChangeText={(text) => setCurrentGrade({...currentGrade, code: text})}
              placeholder="Enter course code"
            />

            <Text style={styles.label}>Subject Name</Text>
            <TextInput
              style={styles.input}
              value={currentGrade.name}
              onChangeText={(text) => setCurrentGrade({...currentGrade, name: text})}
              placeholder="Enter subject name"
            />

            <Text style={styles.label}>Professor</Text>
            <TextInput
              style={styles.input}
              value={currentGrade.professor}
              onChangeText={(text) => setCurrentGrade({...currentGrade, professor: text})}
              placeholder="Enter professor name"
            />

            <Text style={styles.label}>Grade</Text>
            <TextInput
              style={styles.input}
              value={currentGrade.grade}
              onChangeText={(text) => setCurrentGrade({...currentGrade, grade: text})}
              placeholder="Enter grade"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Exam Type</Text>
            <View style={styles.termButtons}>
              {['Midterm', 'Finals'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.termButton,
                    currentGrade.type === type && styles.selectedTerm
                  ]}
                  onPress={() => setCurrentGrade({...currentGrade, type})}
                >
                  <Text style={[
                    styles.termButtonText,
                    currentGrade.type === type && styles.selectedTermText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Semester</Text>
            <View style={styles.termButtons}>
              {['current', 'previous'].map(sem => (
                <TouchableOpacity
                  key={sem}
                  style={[
                    styles.termButton,
                    currentGrade.semester === sem && styles.selectedTerm
                  ]}
                  onPress={() => setCurrentGrade({...currentGrade, semester: sem})}
                >
                  <Text style={[
                    styles.termButtonText,
                    currentGrade.semester === sem && styles.selectedTermText
                  ]}>
                    {sem === 'current' ? 'Current' : 'Previous'} Semester
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetGradeForm();
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addGrade}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  studentInfoContainer: {
    backgroundColor: 'white',
    padding: 15,
    margin: 15,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  studentDetails: {
    color: '#666',
  },
  addGradeButton: {
    backgroundColor: '#D75A4A',
    marginHorizontal: 15,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  addGradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  gradesList: {
    paddingHorizontal: 15,
  },
  gradeItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  gradeInfo: {
    flex: 1,
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subjectCode: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  termText: {
    color: '#666',
    fontSize: 14,
  },
  gradeText: {
    fontSize: 15,
    marginTop: 5,
  },
  gradeActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#4A90E2',
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
    width: 45,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#E25A4A',
    padding: 5,
    borderRadius: 5,
    width: 45,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
  },
  emptyList: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
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
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  termButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  termButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 5,
  },
  selectedTerm: {
    backgroundColor: '#D75A4A',
    borderColor: '#D75A4A',
  },
  termButtonText: {
    color: '#333',
  },
  selectedTermText: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex:1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#D75A4A',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});