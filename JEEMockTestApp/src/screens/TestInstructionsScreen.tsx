import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTest } from '../context/TestContext';

export default function TestInstructionsScreen({ navigation }: any) {
  const { selectedTest, startTest } = useTest();

  const handleStart = () => {
    const success = startTest();
    if (success) {
      navigation.replace('TestTaking');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (!selectedTest) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>📚</Text>
          <Text style={styles.title}>{selectedTest.name}</Text>
          <Text style={styles.subtitle}>{selectedTest.description}</Text>
        </View>

        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>Test Instructions:</Text>
          <View style={styles.instruction}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>
              This test contains {selectedTest.questions.length} questions
            </Text>
          </View>
          <View style={styles.instruction}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>
              Duration: {selectedTest.duration / 60} minutes
            </Text>
          </View>
          <View style={styles.instruction}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>
              Marking: +4 for correct, -1 for incorrect
            </Text>
          </View>
          <View style={styles.instruction}>
            <Text style={styles.instructionNumber}>4.</Text>
            <Text style={styles.instructionText}>
              Screenshots are blocked during the test
            </Text>
          </View>
          <View style={styles.instruction}>
            <Text style={styles.instructionNumber}>5.</Text>
            <Text style={styles.instructionText}>
              Any attempt to switch apps will be recorded as a violation
            </Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>I Agree - Start Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  instructionsBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 16,
  },
  instruction: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
    marginRight: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#1e40af',
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
