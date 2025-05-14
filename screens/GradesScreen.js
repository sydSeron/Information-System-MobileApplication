import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const semesterTypes = ['Current Semester', 'Previous Semester', 'All Semesters'];

export default function GradesScreen({ navigation }) {
  const [activeSemester, setActiveSemester] = useState('Current Semester');
  const [grades, setGrades] = useState([]);
  const [gpa, setGpa] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGrade, setNewGrade] = useState({
    code: '',
    name: '',
    professor: '',
    grade: '',
    type: 'Midterm',
    semester: 'current'
  });
  const [currentSemesterGrades, setCurrentSemesterGrades] = useState([]);
  const [previousSemesterGrades, setPreviousSemesterGrades] = useState([]);

  useEffect(() => {
    loadGrades();
  }, []);

  useEffect(() => {
    calculateGPA();
  }, [grades, activeSemester]);

  // Add this effect to recalculate GPA when active semester changes
  useEffect(() => {
    calculateGPA();
  }, [activeSemester, grades]);

  const loadGrades = async () => {
    try {
      // Get student ID from profile data
      const profileData = await AsyncStorage.getItem('profileData');
      const profile = profileData ? JSON.parse(profileData) : {};
      const studentId = profile.studentId;
      
      if (!studentId) {
        console.error('No student ID found');
        return;
      }
      
      // Load student-specific grades
      const studentGradesKey = `grades_${studentId}`;
      const storedGrades = await AsyncStorage.getItem(studentGradesKey);
      
      if (storedGrades) {
        const parsedGrades = JSON.parse(storedGrades);
        setGrades(parsedGrades);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  const saveGrades = async (updatedGrades) => {
    try {
      // Get student ID from profile data
      const profileData = await AsyncStorage.getItem('profileData');
      const profile = profileData ? JSON.parse(profileData) : {};
      const studentId = profile.studentId;
      
      if (!studentId) {
        Alert.alert('Error', 'Could not determine student ID');
        return;
      }
      
      // Save to student-specific storage
      const studentGradesKey = `grades_${studentId}`;
      await AsyncStorage.setItem(studentGradesKey, JSON.stringify(updatedGrades));
      setGrades(updatedGrades);
    } catch (error) {
      console.error('Error saving grades:', error);
      Alert.alert('Error', 'Failed to save grades');
    }
  };

  const handleAddGrade = () => {
    if (!newGrade.code || !newGrade.name || !newGrade.professor || !newGrade.grade) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const gradeNumber = parseFloat(newGrade.grade);
    if (isNaN(gradeNumber) || gradeNumber < 0 || gradeNumber > 100) {
      Alert.alert('Error', 'Grade must be a number between 0 and 100');
      return;
    }

    const updatedGrades = [...grades, {
      ...newGrade,
      id: String(Date.now()), // Convert to string for consistency
      grade: gradeNumber,
      semester: 'current'
    }];
    
    saveGrades(updatedGrades);
    setModalVisible(false);
    setNewGrade({
      code: '',
      name: '',
      professor: '',
      grade: '',
      type: 'Midterm',
      semester: 'current'
    });
  };

  const handleDeleteGrade = (id) => {
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
              
              // Show success message (optional)
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

  const calculateGPA = () => {
    // Get only the grades that should be considered based on active semester
    const gradesToCalculate = getFilteredGrades();
    
    if (gradesToCalculate.length === 0) {
      setGpa(0);
      return;
    }
    
    const total = gradesToCalculate.reduce((sum, subject) => sum + parseFloat(subject.grade), 0);
    const average = total / gradesToCalculate.length;
    
    // Make sure we're dealing with a valid number
    setGpa(isNaN(average) ? 0 : average);
  };

  const markSemesterAsDone = async () => {
    try {
      // Get current grades marked as current semester
      const currentGrades = grades.filter(grade => grade.semester === 'current');
      
      if (currentGrades.length === 0) {
        Alert.alert('No Grades', 'There are no current semester grades to archive.');
        return;
      }
      
      // Update all current grades to previous semester
      const updatedGrades = grades.map(grade => {
        if (grade.semester === 'current') {
          return { ...grade, semester: 'previous' };
        }
        return grade;
      });
      
      // Save the updated grades
      await saveGrades(updatedGrades);
      
      // Update state
      setGrades(updatedGrades);
      Alert.alert('Success', 'Current semester grades moved to previous semester.');
    } catch (error) {
      console.error('Error marking semester as done:', error);
      Alert.alert('Error', 'Failed to archive semester grades');
    }
  };

  const getFilteredGrades = () => {
    switch (activeSemester) {
      case 'Current Semester':
        return grades.filter(grade => grade.semester === 'current');
      case 'Previous Semester':
        return grades.filter(grade => grade.semester === 'previous');
      case 'All Semesters':
      default:
        return grades;
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return '#4CAF50';
    if (grade >= 80) return '#2196F3';
    if (grade >= 70) return '#FFC107';
    return '#F44336';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grades & Performance</Text>
      </View>

      <View style={styles.gpaContainer}>
        <Text style={styles.gpaLabel}>Semester GPA</Text>
        <Text style={styles.gpaValue}>{gpa.toFixed(2)}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(gpa/100) * 100}%`, backgroundColor: getGradeColor(gpa) }]} />
          <View style={styles.progressBarLabels}>
            <Text style={styles.progressBarLabel}>0</Text>
            <Text style={styles.progressBarLabel}>50</Text>
            <Text style={styles.progressBarLabel}>100</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
      >
        {semesterTypes.map((type, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              activeSemester === type && styles.activeTab
            ]}
            onPress={() => setActiveSemester(type)}
          >
            <Text style={[
              styles.tabText,
              activeSemester === type && styles.activeTabText
            ]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.semesterActionContainer}>
        {activeSemester === 'Current Semester' && (
          <TouchableOpacity 
            style={styles.semesterDoneButton} 
            onPress={markSemesterAsDone}
          >
            <Text style={styles.semesterDoneButtonText}>Mark Semester as Done</Text>
          </TouchableOpacity>
        )}
      </View>

      {getFilteredGrades().map((subject, index) => (
        <TouchableOpacity key={subject.id || index} style={styles.subjectItem}>
          <View style={styles.subjectHeader}>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.subjectCode}>{subject.code} • {subject.professor}</Text>
            </View>
            <View style={styles.gradeContainer}>
              <Text style={[styles.grade, { color: getGradeColor(subject.grade) }]}>
                {subject.grade}
              </Text>
              <Text style={styles.gradeType}>{subject.type}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteGrade(subject.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#D75A4A" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      {activeSemester === 'Current Semester' && (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Grade</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Grade</Text>
            <TextInput
              style={styles.input}
              placeholder="Course Code (e.g., IT 301)"
              value={newGrade.code}
              onChangeText={(text) => setNewGrade({ ...newGrade, code: text })}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Course Name"
              value={newGrade.name}
              onChangeText={(text) => setNewGrade({ ...newGrade, name: text })}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Professor"
              value={newGrade.professor}
              onChangeText={(text) => setNewGrade({ ...newGrade, professor: text })}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Grade (0-100)"
              value={newGrade.grade}
              onChangeText={(text) => setNewGrade({ ...newGrade, grade: text })}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
            <Text style={styles.label}>Exam Type</Text>
            <View style={styles.examTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.examTypeButton,
                  newGrade.type === 'Midterm' && styles.selectedExamType
                ]}
                onPress={() => setNewGrade({ ...newGrade, type: 'Midterm' })}
              >
                <Text style={[
                  styles.examTypeText,
                  newGrade.type === 'Midterm' && styles.selectedExamTypeText
                ]}>Midterm</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.examTypeButton,
                  newGrade.type === 'Finals' && styles.selectedExamType
                ]}
                onPress={() => setNewGrade({ ...newGrade, type: 'Finals' })}
              >
                <Text style={[
                  styles.examTypeText,
                  newGrade.type === 'Finals' && styles.selectedExamTypeText
                ]}>Finals</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddGrade}>
              <Text style={styles.saveButtonText}>Save Grade</Text>
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
  gpaContainer: {
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  gpaLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  gpaValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressBarLabel: {
    fontSize: 12,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
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
  semesterActionContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  semesterDoneButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  semesterDoneButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  subjectItem: {
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subjectCode: {
    fontSize: 14,
    color: '#666',
  },
  gradeContainer: {
    alignItems: 'flex-end',
  },
  grade: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gradeType: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
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
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  examTypeContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  examTypeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  selectedExamType: {
    backgroundColor: '#D75A4A',
    borderColor: '#D75A4A',
  },
  examTypeText: {
    color: '#666',
  },
  selectedExamTypeText: {
    color: 'white',
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
  },
});