import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  testName: string;
  date: string;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Rahul Sharma', score: 180, totalQuestions: 50, percentage: 90, testName: 'White Mock Test 1', date: '2024-11-28' },
  { rank: 2, name: 'Priya Patel', score: 172, totalQuestions: 50, percentage: 86, testName: 'White Mock Test 1', date: '2024-11-28' },
  { rank: 3, name: 'Amit Kumar', score: 168, totalQuestions: 50, percentage: 84, testName: 'White Mock Test 1', date: '2024-11-27' },
  { rank: 4, name: 'Sneha Gupta', score: 160, totalQuestions: 50, percentage: 80, testName: 'Blue Mock Test 1', date: '2024-11-27' },
  { rank: 5, name: 'Vikram Singh', score: 156, totalQuestions: 50, percentage: 78, testName: 'White Mock Test 1', date: '2024-11-26' },
  { rank: 6, name: 'Ananya Reddy', score: 152, totalQuestions: 50, percentage: 76, testName: 'Grey Mock Test 1', date: '2024-11-26' },
  { rank: 7, name: 'Rohan Joshi', score: 148, totalQuestions: 50, percentage: 74, testName: 'White Mock Test 1', date: '2024-11-25' },
  { rank: 8, name: 'Kavya Nair', score: 144, totalQuestions: 50, percentage: 72, testName: 'PYQ 2024', date: '2024-11-25' },
  { rank: 9, name: 'Arjun Mehta', score: 140, totalQuestions: 50, percentage: 70, testName: 'White Mock Test 1', date: '2024-11-24' },
  { rank: 10, name: 'Ishita Bansal', score: 136, totalQuestions: 50, percentage: 68, testName: 'Latest Pattern 1', date: '2024-11-24' },
];

export default function LeaderboardScreen({ navigation }: any) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '👑';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank.toString();
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#fbbf24';
      case 2:
        return '#9ca3af';
      case 3:
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🏆</Text>
          <View>
            <Text style={styles.headerTitle}>Leaderboard</Text>
            <Text style={styles.headerSubtitle}>Top performers across all tests</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {mockLeaderboard.map((entry) => (
          <View
            key={entry.rank}
            style={[
              styles.entryCard,
              entry.rank <= 3 && styles.topThreeCard
            ]}
          >
            <View style={styles.rankContainer}>
              <Text style={[styles.rankIcon, { color: getRankColor(entry.rank) }]}>
                {getRankIcon(entry.rank)}
              </Text>
            </View>

            <View style={styles.entryContent}>
              <Text style={styles.entryName}>{entry.name}</Text>
              <Text style={styles.entryTest}>{entry.testName}</Text>
            </View>

            <View style={styles.entryStats}>
              <Text style={styles.entryScore}>
                {entry.score}
                <Text style={styles.entryScoreSub}>/{entry.totalQuestions * 4}</Text>
              </Text>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>⭐ {entry.percentage}%</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Rankings are updated after each test submission
          </Text>
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
    backgroundColor: '#2563eb',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 36,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
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
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  topThreeCard: {
    borderColor: '#fbbf24',
    backgroundColor: '#fffbeb',
  },
  rankContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  entryContent: {
    flex: 1,
  },
  entryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  entryTest: {
    fontSize: 12,
    color: '#6b7280',
  },
  entryStats: {
    alignItems: 'flex-end',
  },
  entryScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  entryScoreSub: {
    fontSize: 14,
    color: '#6b7280',
  },
  percentageBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
