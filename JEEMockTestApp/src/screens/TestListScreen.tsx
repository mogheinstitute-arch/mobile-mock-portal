import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTest, testCategories } from '../context/TestContext';

export default function TestListScreen({ navigation }: any) {
  const { currentUser, logout } = useAuth();
  const { tests, selectTest, hasSavedState, savedStateInfo, resumeTest, clearSavedState } = useTest();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(hasSavedState);

  const filteredTests = selectedCategory
    ? tests.filter(t => t.category === selectedCategory)
    : tests;

  const handleStartTest = (test: any) => {
    selectTest(test);
    navigation.navigate('TestInstructions');
  };

  const handleResume = () => {
    const success = resumeTest();
    if (success) {
      setShowResumeModal(false);
      navigation.navigate('TestTaking');
    } else {
      Alert.alert('Error', 'Failed to resume test');
      clearSavedState();
      setShowResumeModal(false);
    }
  };

  const handleDiscard = () => {
    clearSavedState();
    setShowResumeModal(false);
  };

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResumeModal && savedStateInfo) {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalIcon}>🔄</Text>
          <Text style={styles.modalTitle}>Resume Previous Test?</Text>
          <Text style={styles.modalSubtitle}>You have an unfinished test that was interrupted.</Text>

          <View style={styles.modalInfo}>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Test:</Text>
              <Text style={styles.modalInfoValue}>{savedStateInfo.testName}</Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Time Remaining:</Text>
              <Text style={styles.modalInfoValue}>{formatTime(savedStateInfo.timeLeft)}</Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoLabel}>Last Saved:</Text>
              <Text style={styles.modalInfoValue}>{savedStateInfo.savedAt.toLocaleTimeString()}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
            <Text style={styles.resumeButtonText}>Resume Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.discardButton} onPress={handleDiscard}>
            <Text style={styles.discardButtonText}>Discard & Start Fresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛡️ JEE B.Arch</Text>
          <Text style={styles.headerSubtitle}>{currentUser?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome to JEE B.Arch Mock Tests</Text>
          <Text style={styles.sectionSubtitle}>Select a category and test to begin your preparation</Text>
        </View>

        <View style={styles.categories}>
          {testCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardActive
              ]}
              onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.testsTitle}>Available Tests</Text>
        {filteredTests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>No tests available in this category</Text>
          </View>
        ) : (
          <View style={styles.tests}>
            {filteredTests.map(test => (
              <View key={test.id} style={styles.testCard}>
                <View style={styles.testHeader}>
                  <View style={styles.testInfo}>
                    <Text style={styles.testName}>{test.name}</Text>
                    <Text style={styles.testDescription}>{test.description}</Text>
                  </View>
                  <Text style={styles.testIcon}>📚</Text>
                </View>
                <View style={styles.testMeta}>
                  <Text style={styles.testMetaText}>⏱️ {test.duration / 60} min</Text>
                  <Text style={styles.testMetaText}>{test.questions.length} Questions</Text>
                </View>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => handleStartTest(test)}
                >
                  <Text style={styles.startButtonText}>Start Test</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  categoryCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  testsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  tests: {
    gap: 16,
    paddingBottom: 24,
  },
  testCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  testIcon: {
    fontSize: 32,
  },
  testMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  testMetaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  startButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
  },
  modalIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalInfo: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  resumeButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  resumeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  discardButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  discardButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
