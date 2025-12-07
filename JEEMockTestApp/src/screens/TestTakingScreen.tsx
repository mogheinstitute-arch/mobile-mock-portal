import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, AppState, Modal } from 'react-native';
import { useTest } from '../context/TestContext';
import { useAuth } from '../context/AuthContext';
import * as ScreenCapture from 'expo-screen-capture';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

export default function TestTakingScreen({ navigation }: any) {
  const { currentUser } = useAuth();
  const {
    questions,
    currentQuestion,
    answers,
    markedForReview,
    visitedQuestions,
    timeLeft,
    testCompleted,
    showResults,
    violations,
    selectedTest,
    handleAnswer,
    clearResponse,
    handleSaveAndNext,
    handleMarkAndNext,
    handleSubmit,
    handleQuestionNavigation,
    addViolation,
    setTestCompleted,
    setShowResults,
    getStatusCounts,
    calculateScore,
    saveTestAttempt,
  } = useTest();

  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  useEffect(() => {
    activateKeepAwakeAsync();

    const enableScreenshotBlock = async () => {
      try {
        const hasPermissions = await ScreenCapture.preventScreenCaptureAsync();
        if (!hasPermissions) {
          addViolation('Screenshot blocking permission denied');
        }
      } catch (error) {
        console.error('Error enabling screenshot blocking:', error);
      }
    };

    enableScreenshotBlock();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        addViolation('App switched to background');
      }
    });

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
      deactivateKeepAwake();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (showResults && !resultSaved && currentUser) {
      saveTestAttempt(currentUser.email);
      setResultSaved(true);
    }
  }, [showResults, resultSaved, currentUser, saveTestAttempt]);

  useEffect(() => {
    if (!showResults) {
      setResultSaved(false);
    }
  }, [showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const confirmSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    let message = 'Are you sure you want to submit the test?';
    if (unansweredCount > 0) {
      message = `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`;
    }
    Alert.alert(
      'Submit Test',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: handleSubmit, style: 'destructive' }
      ]
    );
  };

  if (showResults) {
    return <ResultsScreen navigation={navigation} />;
  }

  if (questions.length === 0 || testCompleted) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  const q = questions[currentQuestion];
  if (!q) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Invalid question</Text>
      </View>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.testName}>{selectedTest?.name}</Text>
        </View>
        <Text style={styles.timer}>Time: {formatTime(timeLeft)}</Text>
      </View>

      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>Question No. {currentQuestion + 1}</Text>
        <TouchableOpacity
          style={styles.panelButton}
          onPress={() => setShowQuestionPanel(true)}
        >
          <Text style={styles.panelButtonText}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.questionText}>{q.question}</Text>

        {q.image && (
          <Image
            source={{ uri: q.image }}
            style={styles.questionImage}
            resizeMode="contain"
          />
        )}

        <View style={styles.options}>
          {q.shuffledOptions.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.optionRow}
              onPress={() => handleAnswer(q.id, idx)}
            >
              <View style={[
                styles.radio,
                answers[q.id] === idx && styles.radioSelected
              ]}>
                {answers[q.id] === idx && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.optionText}>
                <Text style={styles.optionLetter}>{String.fromCharCode(65 + idx)}.</Text> {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={handleMarkAndNext}>
          <Text style={styles.footerButtonText}>Mark & Next</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={clearResponse}>
          <Text style={styles.footerButtonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerButton, styles.primaryButton]} onPress={handleSaveAndNext}>
          <Text style={[styles.footerButtonText, styles.primaryButtonText]}>Save & Next</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerButton, styles.submitButton]} onPress={confirmSubmit}>
          <Text style={[styles.footerButtonText, styles.primaryButtonText]}>Submit</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showQuestionPanel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuestionPanel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Question Panel</Text>
              <TouchableOpacity onPress={() => setShowQuestionPanel(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statusLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#22c55e' }]} />
                <Text style={styles.legendText}>Answered: {statusCounts.answered}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.legendText}>Not Answered: {statusCounts.visitedNotAnswered}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#9ca3af' }]} />
                <Text style={styles.legendText}>Not Visited: {statusCounts.notVisited}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#a855f7' }]} />
                <Text style={styles.legendText}>Review: {statusCounts.markedForReviewCount}</Text>
              </View>
            </View>

            <ScrollView style={styles.questionGrid}>
              <View style={styles.questionGridInner}>
                {questions.map((_, idx) => {
                  const qId = questions[idx].id;
                  const isAnswered = answers[qId] !== undefined;
                  const isMarked = markedForReview[qId];
                  const isCurrent = idx === currentQuestion;
                  const isVisited = visitedQuestions.has(idx);

                  let bgColor = '#9ca3af';
                  if (isCurrent) {
                    bgColor = '#f97316';
                  } else if (isAnswered && isMarked) {
                    bgColor = '#a855f7';
                  } else if (isAnswered) {
                    bgColor = '#22c55e';
                  } else if (isMarked) {
                    bgColor = '#a855f7';
                  } else if (isVisited) {
                    bgColor = '#ef4444';
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.questionButton, { backgroundColor: bgColor }]}
                      onPress={() => {
                        handleQuestionNavigation(idx);
                        setShowQuestionPanel(false);
                      }}
                    >
                      <Text style={styles.questionButtonText}>{idx + 1}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ResultsScreen({ navigation }: any) {
  const { currentUser, logout } = useAuth();
  const { questions, answers, selectedTest, violations, restartTest, calculateScore } = useTest();
  const { correct, incorrect, unattempted, totalMarks, maxMarks } = calculateScore();
  const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);

  const handleTakeAnother = () => {
    restartTest();
    navigation.replace('TestList');
  };

  const handleLogout = () => {
    restartTest();
    logout();
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Test Results</Text>
        <Text style={styles.resultsSubtitle}>{selectedTest?.name}</Text>
        <Text style={styles.resultsStudent}>{currentUser?.email}</Text>
      </View>

      {violations.length > 0 && (
        <View style={styles.violationsBox}>
          <Text style={styles.violationsTitle}>Security Violations: {violations.length}</Text>
          <ScrollView style={styles.violationsList}>
            {violations.map((v, idx) => (
              <Text key={idx} style={styles.violationItem}>• {v}</Text>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Your Score</Text>
        <View style={styles.scoreStats}>
          <View style={styles.scoreStat}>
            <Text style={styles.scoreStatValue}>{correct}</Text>
            <Text style={styles.scoreStatLabel}>Correct</Text>
          </View>
          <View style={styles.scoreStat}>
            <Text style={styles.scoreStatValue}>{incorrect}</Text>
            <Text style={styles.scoreStatLabel}>Incorrect</Text>
          </View>
          <View style={styles.scoreStat}>
            <Text style={styles.scoreStatValue}>{unattempted}</Text>
            <Text style={styles.scoreStatLabel}>Unattempted</Text>
          </View>
        </View>
        <View style={styles.totalScore}>
          <Text style={styles.totalScoreValue}>{totalMarks} / {maxMarks}</Text>
          <Text style={styles.totalScoreLabel}>Marks Obtained ({percentage}%)</Text>
          <Text style={styles.markingScheme}>Marking: +4 correct, -1 incorrect</Text>
        </View>
      </View>

      <View style={styles.resultsButtons}>
        <TouchableOpacity style={styles.resultButton} onPress={handleTakeAnother}>
          <Text style={styles.resultButtonText}>Take Another Test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.resultButton, styles.logoutResultButton]} onPress={handleLogout}>
          <Text style={styles.resultButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    padding: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  panelButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  panelButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
    fontWeight: '500',
  },
  questionImage: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  options: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9ca3af',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#2563eb',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  optionLetter: {
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  submitButton: {
    backgroundColor: '#06b6d4',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  statusLegend: {
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
  questionGrid: {
    maxHeight: 300,
  },
  questionGridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  questionButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  resultsHeader: {
    backgroundColor: '#2563eb',
    padding: 24,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  resultsStudent: {
    fontSize: 14,
    color: '#dbeafe',
  },
  violationsBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  violationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 8,
  },
  violationsList: {
    maxHeight: 100,
  },
  violationItem: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 4,
  },
  scoreCard: {
    backgroundColor: '#2563eb',
    margin: 16,
    padding: 24,
    borderRadius: 12,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  scoreStat: {
    alignItems: 'center',
  },
  scoreStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scoreStatLabel: {
    fontSize: 12,
    color: '#dbeafe',
    marginTop: 4,
  },
  totalScore: {
    borderTopWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    paddingTop: 24,
    alignItems: 'center',
  },
  totalScoreValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  totalScoreLabel: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
  },
  markingScheme: {
    fontSize: 12,
    color: '#dbeafe',
  },
  resultsButtons: {
    padding: 16,
    gap: 12,
  },
  resultButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutResultButton: {
    backgroundColor: '#6b7280',
  },
  resultButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
