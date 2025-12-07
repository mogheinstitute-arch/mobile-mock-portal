import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTest } from '../context/TestContext';

export default function AnalyticsScreen({ navigation }: any) {
  const { currentUser } = useAuth();
  const { getStudentAttempts } = useTest();

  const studentAttempts = currentUser ? getStudentAttempts(currentUser.email) : [];

  const totalTests = studentAttempts.length;
  const avgScore = totalTests > 0
    ? Math.round(studentAttempts.reduce((acc, a) => acc + a.score, 0) / totalTests)
    : 0;
  const avgPercentage = totalTests > 0
    ? Math.round(studentAttempts.reduce((acc, a) => acc + (a.score / (a.totalQuestions * 4) * 100), 0) / totalTests)
    : 0;
  const totalCorrect = studentAttempts.reduce((acc, a) => acc + a.correctAnswers, 0);
  const totalIncorrect = studentAttempts.reduce((acc, a) => acc + a.wrongAnswers, 0);
  const totalUnattempted = studentAttempts.reduce((acc, a) => acc + a.unattempted, 0);
  const accuracyRate = totalCorrect + totalIncorrect > 0
    ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Performance Analytics</Text>
          <Text style={styles.headerSubtitle}>{currentUser?.email}</Text>
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statLabel}>Tests Taken</Text>
            <Text style={styles.statValue}>{totalTests}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#22c55e' }]}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
            <Text style={styles.statValue}>{avgScore}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#a855f7' }]}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statLabel}>Avg %</Text>
            <Text style={styles.statValue}>{avgPercentage}%</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#f97316' }]}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>{accuracyRate}%</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>✓</Text>
            <Text style={styles.summaryLabel}>Total Correct</Text>
            <Text style={[styles.summaryValue, { color: '#22c55e' }]}>{totalCorrect}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>✗</Text>
            <Text style={styles.summaryLabel}>Total Incorrect</Text>
            <Text style={[styles.summaryValue, { color: '#ef4444' }]}>{totalIncorrect}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>○</Text>
            <Text style={styles.summaryLabel}>Unattempted</Text>
            <Text style={[styles.summaryValue, { color: '#6b7280' }]}>{totalUnattempted}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Test History</Text>
        {studentAttempts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No tests attempted yet. Start a test to see your history here!</Text>
          </View>
        ) : (
          studentAttempts.map((attempt) => (
            <View key={attempt.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTestName}>{attempt.testName}</Text>
                <Text style={styles.historyDate}>
                  {new Date(attempt.submittedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.historyStats}>
                <View style={styles.historyStat}>
                  <Text style={styles.historyStatValue}>
                    {attempt.score}/{attempt.totalQuestions * 4}
                  </Text>
                  <Text style={styles.historyStatLabel}>Score</Text>
                </View>
                <View style={styles.historyStat}>
                  <Text style={[styles.historyStatValue, { color: '#22c55e' }]}>
                    {attempt.correctAnswers}
                  </Text>
                  <Text style={styles.historyStatLabel}>Correct</Text>
                </View>
                <View style={styles.historyStat}>
                  <Text style={[styles.historyStatValue, { color: '#ef4444' }]}>
                    {attempt.wrongAnswers}
                  </Text>
                  <Text style={styles.historyStatLabel}>Wrong</Text>
                </View>
                <View style={styles.historyStat}>
                  <Text style={[styles.historyStatValue, { color: '#a855f7' }]}>
                    {Math.round((attempt.score / (attempt.totalQuestions * 4)) * 100)}%
                  </Text>
                  <Text style={styles.historyStatLabel}>Percentage</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(attempt.score / (attempt.totalQuestions * 4)) * 100}%` }
                  ]}
                />
              </View>
            </View>
          ))
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
    backgroundColor: '#2563eb',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#dbeafe',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  historyStat: {
    alignItems: 'center',
  },
  historyStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  historyStatLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
});
