import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question, ShuffledQuestion, Test, TestCategory, TestAttempt } from "../types";
import { supabase } from "../lib/supabase";

const SAVED_TEST_STATE_KEY = 'jee_mock_test_saved_state';

const sampleQuestions: Question[] = [
  { id: 1, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=1VypMXlWqcUFk3AHY15R5QQsr-xKhB0RZ&sz=w2000", optionA: "b", optionB: "a", optionC: "d", optionD: "c", correctOption: "d" },
  { id: 2, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=1g1NuHqJrUZVkwN14484udRStI-8_hMIE&sz=w2000", optionA: "b", optionB: "a", optionC: "d", optionD: "c", correctOption: "d" },
  { id: 3, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=1esGjNMzajetl-BrKhQUnAYoxY4jDy6Lq&sz=w2000", optionA: "b", optionB: "a", optionC: "d", optionD: "c", correctOption: "d" },
  { id: 4, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=183VWs6PZFsWQAgEMmRqlRRxsqpqed_Yb&sz=w2000", optionA: "d", optionB: "c", optionC: "a", optionD: "b", correctOption: "d" },
  { id: 5, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=1RU_qpgh_Yy-w5OXzjhnJuE-obYSw5Umv&sz=w2000", optionA: "d", optionB: "c", optionC: "b", optionD: "a", correctOption: "d" },
];

const DEFAULT_TEST_DURATION = 3600;

export const testCategories: TestCategory[] = [
  {
    id: "white",
    name: "White Mock Tests",
    icon: "⚪",
    color: "#ffffff",
    description: "Comprehensive mock tests",
  },
  {
    id: "blue",
    name: "Blue Mock Tests",
    icon: "🔵",
    color: "#dbeafe",
    description: "Advanced practice tests",
  },
  {
    id: "grey",
    name: "Grey Mock Tests",
    icon: "⚫",
    color: "#f9fafb",
    description: "Standard difficulty tests",
  },
  {
    id: "pyq",
    name: "PYQ (2005-2025)",
    icon: "📚",
    color: "#fef3c7",
    description: "Previous Year Questions",
  },
  {
    id: "latest",
    name: "Latest Pattern",
    icon: "🆕",
    color: "#dcfce7",
    description: "New test pattern",
  },
];

const initialTests: Test[] = [
  { id: 'White Mock Test 1', name: 'White Mock Test 1', description: 'Mock test based on Actual PYQ', duration: DEFAULT_TEST_DURATION, questions: sampleQuestions.slice(0, 50), category: 'white' },
];

export function shuffleOptions(question: Question): ShuffledQuestion {
  const options = [
    { text: question.optionA, originalKey: "a" },
    { text: question.optionB, originalKey: "b" },
    { text: question.optionC, originalKey: "c" },
    { text: question.optionD, originalKey: "d" },
  ];
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const correctIndex = shuffled.findIndex(
    (opt) => opt.originalKey === question.correctOption,
  );
  return {
    ...question,
    shuffledOptions: shuffled,
    correctIndex,
  };
}

interface SavedTestState {
  testId: string;
  userEmail: string;
  answers: Record<number, number>;
  markedForReview: Record<number, boolean>;
  visitedQuestions: number[];
  currentQuestion: number;
  timeLeft: number;
  shuffledQuestions: ShuffledQuestion[];
  violations: string[];
  tabSwitchCount: number;
  savedAt: number;
}

interface TestContextType {
  tests: Test[];
  selectedTest: Test | null;
  testStarted: boolean;
  questions: ShuffledQuestion[];
  currentQuestion: number;
  answers: Record<number, number>;
  markedForReview: Record<number, boolean>;
  visitedQuestions: Set<number>;
  timeLeft: number;
  testCompleted: boolean;
  showResults: boolean;
  violations: string[];
  hasSavedState: boolean;
  savedStateInfo: { testName: string; timeLeft: number; savedAt: Date } | null;
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  setSelectedTest: React.Dispatch<React.SetStateAction<Test | null>>;
  selectTest: (test: Test) => void;
  startTest: () => boolean;
  resumeTest: () => boolean;
  clearSavedState: () => void;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<number>>;
  handleAnswer: (questionId: number, answerIndex: number) => void;
  clearResponse: () => void;
  handleSaveAndNext: () => void;
  handleMarkAndNext: () => void;
  handleSubmit: () => void;
  restartTest: () => void;
  handleQuestionNavigation: (idx: number) => void;
  addViolation: (message: string) => void;
  setTestCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  setShowResults: React.Dispatch<React.SetStateAction<boolean>>;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  getStatusCounts: () => {
    answered: number;
    visitedNotAnswered: number;
    notVisited: number;
    markedForReviewCount: number;
    answeredMarked: number;
  };
  calculateScore: () => {
    correct: number;
    incorrect: number;
    unattempted: number;
    totalMarks: number;
    maxMarks: number;
  };
  addTest: (
    name: string,
    description: string,
    duration: number,
  ) => { success: boolean; message: string };
  deleteTest: (testId: string) => void;
  testAttempts: TestAttempt[];
  getStudentAttempts: (studentEmail: string) => TestAttempt[];
  getAllAttempts: () => TestAttempt[];
  saveTestAttempt: (studentEmail: string) => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export function TestProvider({ children }: { children: ReactNode }) {
  const [tests, setTests] = useState<Test[]>(initialTests);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TEST_DURATION);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [violations, setViolations] = useState<string[]>([]);
  const [savedStateData, setSavedStateData] = useState<SavedTestState | null>(null);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);

  const loadAttemptsFromSupabase = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('student_test_history')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (error) {
        console.error('Error loading test attempts from Supabase:', error);
        return;
      }
      if (data) {
        const attempts: TestAttempt[] = data.map((row: any) => ({
          id: row.id,
          studentEmail: row.student_email,
          testId: row.test_id,
          testName: row.test_name,
          score: row.score,
          totalQuestions: row.total_questions,
          correctAnswers: row.correct_answers,
          wrongAnswers: row.wrong_answers,
          unattempted: row.unattempted,
          timeTaken: row.time_taken,
          totalTime: row.total_questions * 60,
          violations: [],
          tabSwitchCount: row.violations,
          submittedAt: new Date(row.submitted_at).getTime()
        }));
        setTestAttempts(attempts);
      }
    } catch (e) {
      console.error('Error loading test attempts:', e);
    }
  }, []);

  useEffect(() => {
    loadAttemptsFromSupabase();
  }, [loadAttemptsFromSupabase]);

  const saveTestAttempt = useCallback(async (studentEmail: string) => {
    if (!selectedTest || questions.length === 0) return;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    questions.forEach((q) => {
      if (answers[q.id] !== undefined) {
        if (answers[q.id] === q.correctIndex) {
          correct++;
        } else {
          incorrect++;
        }
      } else {
        unattempted++;
      }
    });
    const totalMarks = correct * 4 - incorrect * 1;
    const timeTaken = selectedTest.duration - timeLeft;

    const attemptData = {
      student_email: studentEmail,
      test_name: selectedTest.name,
      test_id: selectedTest.id,
      score: totalMarks,
      total_questions: questions.length,
      correct_answers: correct,
      wrong_answers: incorrect,
      unattempted: unattempted,
      time_taken: timeTaken,
      violations: violations.length,
      submitted_at: new Date().toISOString()
    };

    if (!supabase) {
      console.warn('Supabase not configured. Test attempt not saved to database.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('student_test_history')
        .insert([attemptData])
        .select()
        .single();
      if (error) {
        console.error('Error saving test attempt to Supabase:', error);
        return;
      }
      if (data) {
        const newAttempt: TestAttempt = {
          id: data.id,
          studentEmail,
          testId: selectedTest.id,
          testName: selectedTest.name,
          score: totalMarks,
          totalQuestions: questions.length,
          correctAnswers: correct,
          wrongAnswers: incorrect,
          unattempted,
          timeTaken,
          totalTime: selectedTest.duration,
          violations,
          tabSwitchCount: 0,
          submittedAt: new Date(data.submitted_at).getTime()
        };
        setTestAttempts(prev => [newAttempt, ...prev]);
      }
    } catch (e) {
      console.error('Error saving test attempt:', e);
    }
  }, [selectedTest, questions, answers, timeLeft, violations]);

  const getStudentAttempts = useCallback((studentEmail: string): TestAttempt[] => {
    return testAttempts.filter(a => a.studentEmail === studentEmail).sort((a, b) => b.submittedAt - a.submittedAt);
  }, [testAttempts]);

  const getAllAttempts = useCallback((): TestAttempt[] => {
    return [...testAttempts].sort((a, b) => b.submittedAt - a.submittedAt);
  }, [testAttempts]);

  const loadSavedState = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(SAVED_TEST_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SavedTestState;
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        if (parsed.savedAt > oneHourAgo && parsed.timeLeft > 0) {
          setSavedStateData(parsed);
          return;
        } else {
          await AsyncStorage.removeItem(SAVED_TEST_STATE_KEY);
        }
      }
    } catch (e) {
      console.error('Error reading saved test state:', e);
    }
    setSavedStateData(null);
  }, []);

  useEffect(() => {
    loadSavedState();
  }, [loadSavedState]);

  const savedTest = savedStateData ? tests.find(t => t.id === savedStateData.testId) : null;
  const hasSavedState = !!savedStateData && !!savedTest && !testStarted;
  const savedStateInfo = savedStateData && savedTest && !testStarted ? {
    testName: savedTest.name,
    timeLeft: savedStateData.timeLeft,
    savedAt: new Date(savedStateData.savedAt)
  } : null;

  const saveTestState = useCallback(async () => {
    if (testStarted && !testCompleted && selectedTest && questions.length > 0) {
      const stateToSave: SavedTestState = {
        testId: selectedTest.id,
        userEmail: '',
        answers,
        markedForReview,
        visitedQuestions: Array.from(visitedQuestions),
        currentQuestion,
        timeLeft,
        shuffledQuestions: questions,
        violations,
        tabSwitchCount: 0,
        savedAt: Date.now()
      };
      try {
        await AsyncStorage.setItem(SAVED_TEST_STATE_KEY, JSON.stringify(stateToSave));
      } catch (e) {
        console.error('Error saving test state:', e);
      }
    }
  }, [testStarted, testCompleted, selectedTest, questions, answers, markedForReview, visitedQuestions, currentQuestion, timeLeft, violations]);

  const clearSavedState = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SAVED_TEST_STATE_KEY);
      setSavedStateData(null);
    } catch (e) {
      console.error('Error clearing saved state:', e);
    }
  }, []);

  useEffect(() => {
    if (testStarted && !testCompleted) {
      const interval = setInterval(saveTestState, 5000);
      return () => clearInterval(interval);
    }
  }, [testStarted, testCompleted, saveTestState]);

  const addViolation = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setViolations((prev) => [...prev, `${timestamp}: ${message}`]);
  };

  const selectTest = (test: Test) => {
    setSelectedTest(test);
    setTimeLeft(test.duration);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setMarkedForReview({});
    setVisitedQuestions(new Set([0]));
    setTestCompleted(false);
    setShowResults(false);
    setViolations([]);
    setTestStarted(false);
  };

  const startTest = (): boolean => {
    if (selectedTest && selectedTest.questions && selectedTest.questions.length > 0) {
      try {
        clearSavedState();
        setSavedStateData(null);
        const shuffled = selectedTest.questions.map((q) => shuffleOptions(q));
        setQuestions(shuffled);
        setTestStarted(true);
        setCurrentQuestion(0);
        setAnswers({});
        setMarkedForReview({});
        setVisitedQuestions(new Set([0]));
        setTimeLeft(selectedTest.duration);
        setTestCompleted(false);
        setShowResults(false);
        setViolations([]);
        return true;
      } catch (error) {
        console.error("Error starting test:", error);
        return false;
      }
    }
    return false;
  };

  const resumeTest = (): boolean => {
    if (!savedStateData) return false;
    const test = tests.find(t => t.id === savedStateData.testId);
    if (!test) return false;
    try {
      setSelectedTest(test);
      setQuestions(savedStateData.shuffledQuestions);
      setAnswers(savedStateData.answers);
      setMarkedForReview(savedStateData.markedForReview);
      setVisitedQuestions(new Set(savedStateData.visitedQuestions));
      setCurrentQuestion(savedStateData.currentQuestion);
      setTimeLeft(savedStateData.timeLeft);
      setViolations(savedStateData.violations || []);
      setTestStarted(true);
      setTestCompleted(false);
      setShowResults(false);
      setSavedStateData(null);
      return true;
    } catch (error) {
      console.error("Error resuming test:", error);
      clearSavedState();
      return false;
    }
  };

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const clearResponse = () => {
    const qId = questions[currentQuestion]?.id;
    if (qId !== undefined) {
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[qId];
        return newAnswers;
      });
    }
  };

  const handleSaveAndNext = () => {
    if (currentQuestion < questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setVisitedQuestions((prev) => new Set(prev).add(nextQuestion));
    }
  };

  const handleMarkAndNext = () => {
    const qId = questions[currentQuestion]?.id;
    if (qId !== undefined) {
      setMarkedForReview((prev) => ({ ...prev, [qId]: true }));
      if (currentQuestion < questions.length - 1) {
        const nextQuestion = currentQuestion + 1;
        setCurrentQuestion(nextQuestion);
        setVisitedQuestions((prev) => new Set(prev).add(nextQuestion));
      }
    }
  };

  const handleSubmit = () => {
    clearSavedState();
    setTestCompleted(true);
    setShowResults(true);
  };

  const restartTest = () => {
    setTestStarted(false);
    setSelectedTest(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setMarkedForReview({});
    setVisitedQuestions(new Set([0]));
    setTimeLeft(DEFAULT_TEST_DURATION);
    setTestCompleted(false);
    setShowResults(false);
    setViolations([]);
  };

  const handleQuestionNavigation = (idx: number) => {
    setCurrentQuestion(idx);
    setVisitedQuestions((prev) => new Set(prev).add(idx));
  };

  const getStatusCounts = () => {
    let answered = 0;
    let visitedNotAnswered = 0;
    let notVisited = 0;
    let markedForReviewCount = 0;
    let answeredMarked = 0;
    questions.forEach((q, idx) => {
      const isAnswered = answers[q.id] !== undefined;
      const isMarked = markedForReview[q.id];
      const isVisited = visitedQuestions.has(idx);
      if (isAnswered && isMarked) {
        answeredMarked++;
      } else if (isAnswered) {
        answered++;
      } else if (isMarked) {
        markedForReviewCount++;
      } else if (isVisited) {
        visitedNotAnswered++;
      } else {
        notVisited++;
      }
    });
    return {
      answered,
      visitedNotAnswered,
      notVisited,
      markedForReviewCount,
      answeredMarked,
    };
  };

  const calculateScore = () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    questions.forEach((q) => {
      if (answers[q.id] !== undefined) {
        if (answers[q.id] === q.correctIndex) {
          correct++;
        } else {
          incorrect++;
        }
      } else {
        unattempted++;
      }
    });
    const totalMarks = correct * 4 - incorrect * 1;
    const maxMarks = questions.length * 4;
    return { correct, incorrect, unattempted, totalMarks, maxMarks };
  };

  const addTest = (
    name: string,
    description: string,
    duration: number,
  ): { success: boolean; message: string } => {
    if (!name.trim()) {
      return { success: false, message: "Please enter test name" };
    }
    if (isNaN(duration) || duration <= 0) {
      return { success: false, message: "Please enter a valid duration" };
    }
    const newTest: Test = {
      id: "test" + Date.now(),
      name: name.trim(),
      description: description.trim() || "No description",
      duration: duration * 60,
      questions: sampleQuestions,
    };
    setTests((prev) => [...prev, newTest]);
    return {
      success: true,
      message: `Test "${newTest.name}" added successfully!`,
    };
  };

  const deleteTest = (testId: string) => {
    setTests((prev) => prev.filter((t) => t.id !== testId));
  };

  useEffect(() => {
    if (testStarted && !testCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTestCompleted(true);
            setShowResults(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, testCompleted, timeLeft]);

  return (
    <TestContext.Provider
      value={{
        tests,
        selectedTest,
        testStarted,
        questions,
        currentQuestion,
        answers,
        markedForReview,
        visitedQuestions,
        timeLeft,
        testCompleted,
        showResults,
        violations,
        hasSavedState,
        savedStateInfo,
        setTests,
        setSelectedTest,
        selectTest,
        startTest,
        resumeTest,
        clearSavedState,
        setCurrentQuestion,
        handleAnswer,
        clearResponse,
        handleSaveAndNext,
        handleMarkAndNext,
        handleSubmit,
        restartTest,
        handleQuestionNavigation,
        addViolation,
        setTestCompleted,
        setShowResults,
        setTimeLeft,
        getStatusCounts,
        calculateScore,
        addTest,
        deleteTest,
        testAttempts,
        getStudentAttempts,
        getAllAttempts,
        saveTestAttempt,
      }}
    >
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error("useTest must be used within a TestProvider");
  }
  return context;
}

export { DEFAULT_TEST_DURATION };
