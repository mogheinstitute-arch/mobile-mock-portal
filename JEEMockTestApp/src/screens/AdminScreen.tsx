import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTest } from '../context/TestContext';

export default function AdminScreen({ navigation }: any) {
  const { logout, addStudent, deleteStudent, approveStudent, rejectStudent, getPendingStudents, getApprovedStudents } = useAuth();
  const { tests, addTest, deleteTest, getAllAttempts } = useTest();

  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [newTestDesc, setNewTestDesc] = useState('');
  const [newTestDuration, setNewTestDuration] = useState('10');
  const [showResults, setShowResults] = useState(false);

  const pendingStudents = getPendingStudents();
  const approvedStudents = getApprovedStudents();
  const allAttempts = getAllAttempts();

  const handleAddStudent = () => {
    const result = addStudent(newStudentEmail, newStudentPassword, true);
    Alert.alert(result.success ? 'Success' : 'Error', result.message);
    if (result.success) {
      setNewStudentEmail('');
      setNewStudentPassword('');
    }
  };

  const handleDeleteStudent = (email: string) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteStudent(email);
            Alert.alert('Success', `Student ${email} deleted successfully!`);
          }
        }
      ]
    );
  };

  const handleApprove = (email: string) => {
    approveStudent(email);
    Alert.alert('Success', `Student ${email} approved successfully!`);
  };

  const handleReject = (email: string) => {
    Alert.alert(
      'Reject Student',
      `Are you sure you want to reject ${email}? This will delete their account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            rejectStudent(email);
            Alert.alert('Success', `Student ${email} rejected and removed.`);
          }
        }
      ]
    );
  };

  const handleAddTest = () => {
    const duration = parseInt(newTestDuration);
    const result = addTest(newTestName, newTestDesc, duration);
    Alert.alert(result.success ? 'Success' : 'Error', result.message);
    if (result.success) {
      setNewTestName('');
      setNewTestDesc('');
      setNewTestDuration('10');
    }
  };

  const handleDeleteTest = (testId: string) => {
    Alert.alert(
      'Delete Test',
      'Are you sure you want to delete this test?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTest(testId);
            Alert.alert('Success', 'Test deleted successfully!');
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Manage Students & Tests</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Student</Text>
          <TextInput
            style={styles.input}
            value={newStudentEmail}
            onChangeText={setNewStudentEmail}
            placeholder="Student Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={newStudentPassword}
            onChangeText={setNewStudentPassword}
            placeholder="Password"
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleAddStudent}>
            <Text style={styles.buttonText}>Add Student</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Test</Text>
          <TextInput
            style={styles.input}
            value={newTestName}
            onChangeText={setNewTestName}
            placeholder="Test Name"
          />
          <TextInput
            style={styles.input}
            value={newTestDesc}
            onChangeText={setNewTestDesc}
            placeholder="Description"
          />
          <TextInput
            style={styles.input}
            value={newTestDuration}
            onChangeText={setNewTestDuration}
            placeholder="Duration (minutes)"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleAddTest}>
            <Text style={styles.buttonText}>Add Test</Text>
          </TouchableOpacity>
        </View>

        {pendingStudents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Approval ({pendingStudents.length})</Text>
            {pendingStudents.map((student) => (
              <View key={student.email} style={styles.listItem}>
                <Text style={styles.listItemText}>{student.email}</Text>
                <View style={styles.listItemActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(student.email)}
                  >
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(student.email)}
                  >
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approved Students ({approvedStudents.length})</Text>
          {approvedStudents.length === 0 ? (
            <Text style={styles.emptyText}>No approved students yet</Text>
          ) : (
            approvedStudents.map((student) => (
              <View key={student.email} style={styles.listItem}>
                <Text style={styles.listItemText}>{student.email}</Text>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteStudent(student.email)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Tests ({tests.length})</Text>
          {tests.length === 0 ? (
            <Text style={styles.emptyText}>No tests created yet</Text>
          ) : (
            tests.map((test) => (
              <View key={test.id} style={styles.listItem}>
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <Text style={styles.testMeta}>
                    {test.questions.length} questions | {test.duration / 60} min
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteTest(test.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowResults(!showResults)}
          >
            <Text style={styles.sectionTitle}>
              Student Test Results ({allAttempts.length})
            </Text>
            <Text style={styles.toggleIcon}>{showResults ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showResults && (
            allAttempts.length === 0 ? (
              <Text style={styles.emptyText}>No test results yet</Text>
            ) : (
              allAttempts.map((attempt) => (
                <View key={attempt.id} style={styles.resultCard}>
                  <Text style={styles.resultStudent}>{attempt.studentEmail}</Text>
                  <Text style={styles.resultTest}>{attempt.testName}</Text>
                  <View style={styles.resultStats}>
                    <Text style={styles.resultScore}>
                      Score: {attempt.score} / {attempt.totalQuestions * 4}
                    </Text>
                    <Text style={styles.resultDetail}>
                      Correct: {attempt.correctAnswers} | Wrong: {attempt.wrongAnswers}
                    </Text>
                    <Text style={styles.resultDetail}>
                      Time: {Math.floor(attempt.timeTaken / 60)}:{(attempt.timeTaken % 60).toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.resultDate}>
                      {new Date(attempt.submittedAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  listItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  approveButton: {
    backgroundColor: '#22c55e',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  testMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
  toggleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 18,
    color: '#6b7280',
  },
  resultCard: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  resultStudent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  resultTest: {
    fontSize: 13,
    color: '#2563eb',
    marginBottom: 8,
  },
  resultStats: {
    gap: 4,
  },
  resultScore: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  resultDetail: {
    fontSize: 12,
    color: '#6b7280',
  },
  resultDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
});
