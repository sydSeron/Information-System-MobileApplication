import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ navigation }) {
  const [username, setUsername] = useState('Student'); // Default value
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [newNote, setNewNote] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user name
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName) {
          setUsername(storedName);
        }

        // Fetch today's classes
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const storedSchedule = await AsyncStorage.getItem('scheduleData');
        if (storedSchedule) {
          const scheduleData = JSON.parse(storedSchedule);
          const todaysSchedule = scheduleData[today] || [];
          setTodaysClasses(todaysSchedule);
        }

        // Fetch upcoming deadlines
        const storedHomework = await AsyncStorage.getItem('homeworkData');
        if (storedHomework) {
          const homeworkData = JSON.parse(storedHomework);
          const pending = homeworkData.filter(hw => hw.status === 'Pending');
          setUpcomingDeadlines(pending);
        }

        // Fetch notes
        const storedNotes = await AsyncStorage.getItem('studentNotes');
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setTodaysClasses([]);
        setUpcomingDeadlines([]);
        setNotes([]);
      }
    };

    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const newNoteItem = {
        id: Date.now(),
        content: newNote,
        date: new Date().toLocaleDateString()
      };
      
      const updatedNotes = [...notes, newNoteItem];
      await AsyncStorage.setItem('studentNotes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
      setNewNote('');
      setNoteModalVisible(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      await AsyncStorage.setItem('studentNotes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, {username}!</Text>
        <Text style={styles.subtitle}>
          The beautiful thing about learning is that no one can take it away from you.
        </Text>
      </View>

      <View style={styles.quickLinks}>
        {['Schedule', 'Homework', 'Grades', 'Profile'].map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.quickLinkItem}
            onPress={() => {
              if (item === 'Schedule') {
                navigation.navigate('Schedule');
              } else if (item === 'Homework') {
                navigation.navigate('Homework');
              } else if (item === 'Grades') {
                navigation.navigate('Grades');
              } else if (item === 'Profile') {
                navigation.navigate('Profile');
              }
            }}
          >
            <Ionicons 
              name={
                index === 0 ? 'calendar-outline' : 
                index === 1 ? 'book-outline' :
                index === 2 ? 'stats-chart' : 'person-outline'
              } 
              size={24} 
              color="#D75A4A" 
            />
            <Text style={styles.quickLinkText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Classes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {todaysClasses && todaysClasses.length > 0 ? (
            todaysClasses.map((classItem, index) => (
              <View key={index} style={styles.classItem}>
                <View style={styles.classInfo}>
                  <Text style={styles.classTitle}>{classItem.name}</Text>
                  <Text style={styles.classDetails}>
                    {classItem.room} • {classItem.professor}
                  </Text>
                </View>
                <Text style={styles.classTime}>{classItem.time}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyClassContainer}>
              <Text style={styles.emptyMessage}>No classes today.</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Homework')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {upcomingDeadlines.length === 0 ? (
          <Text style={styles.emptyMessage}>No upcoming deadlines.</Text>
        ) : (
          upcomingDeadlines.map((deadline, index) => (
            <View key={index} style={styles.deadlineItem}>
              <View style={styles.deadlineInfo}>
                <Text style={styles.deadlineTitle}>{deadline.title}</Text>
                <Text style={styles.deadlineSubject}>{deadline.subject}</Text>
              </View>
              <View style={styles.deadlineStatus}>
                <Text style={[styles.dueDate, {color: '#D75A4A'}]}>
                  Due {deadline.dueDate}
                </Text>
                <Text style={styles.status}>{deadline.status}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Notes</Text>
          <TouchableOpacity onPress={() => setNoteModalVisible(true)}>
            <Text style={styles.viewAll}>Add Note</Text>
          </TouchableOpacity>
        </View>
        {notes.length === 0 ? (
          <Text style={styles.emptyMessage}>No notes yet. Add your first note!</Text>
        ) : (
          notes.map((note) => (
            <View key={note.id} style={styles.noteItem}>
              <View style={styles.noteContent}>
                <Text style={styles.noteText}>{note.content}</Text>
                <Text style={styles.noteDate}>{note.date}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteNote(note.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#D75A4A" />
              </TouchableOpacity>
            </View>
          ))
        )}
        
        <Modal
          animationType="slide"
          transparent={true}
          visible={noteModalVisible}
          onRequestClose={() => setNoteModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Add New Note</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Write your note here..."
                multiline
                numberOfLines={4}
                value={newNote}
                onChangeText={setNewNote}
              />
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleAddNote}
              >
                <Text style={styles.saveButtonText}>Save Note</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setNoteModalVisible(false);
                  setNewNote('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#D75A4A',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  quickLinks: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-around',
  },
  quickLinkItem: {
    alignItems: 'center',
  },
  quickLinkText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    color: '#D75A4A',
    fontSize: 14,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 10,
  },
  classItem: {
    width: 200,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  classInfo: {
    marginBottom: 8,
  },
  classTitle: {
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
  emptyClassContainer: {
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deadlineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deadlineSubject: {
    fontSize: 14,
    color: '#666',
  },
  deadlineStatus: {
    alignItems: 'flex-end',
  },
  dueDate: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 12,
    color: '#666',
  },
  lastSection: {
    marginBottom: 20,
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D75A4A',
  },
  noteContent: {
    flex: 1,
    marginRight: 10,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 5,
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
  noteInput: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#D75A4A',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
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
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});