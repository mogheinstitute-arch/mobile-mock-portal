import { createContext, useContext, useState, ReactNode } from 'react';
import { UserAccount } from '../types';

const ADMIN_EMAIL = 'admin@jee.com';
const ADMIN_PASSWORD = 'admin123';

const initialAccounts: UserAccount[] = [
  { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin', approved: true },
  { email: 'test@gmail.com', password: 'test123', role: 'student', approved: true },
];

interface LoginResult {
  success: boolean;
  message: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  addStudent: (email: string, password: string, autoApprove?: boolean) => { success: boolean; message: string };
  deleteStudent: (email: string) => void;
  approveStudent: (email: string) => void;
  rejectStudent: (email: string) => void;
  getPendingStudents: () => UserAccount[];
  getApprovedStudents: () => UserAccount[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<UserAccount[]>(initialAccounts);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const login = (email: string, password: string): LoginResult => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = accounts.find(
      acc => acc.email.toLowerCase() === normalizedEmail && acc.password === password
    );
    if (user) {
      if (user.role === 'student' && !user.approved) {
        return { success: false, message: 'Your account is pending admin approval. Please wait for the administrator to approve your account.' };
      }
      setIsAuthenticated(true);
      setCurrentUser(user);
      return { success: true, message: 'Login successful', isAdmin: user.role === 'admin' };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const addStudent = (email: string, password: string, autoApprove: boolean = false): { success: boolean; message: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password.trim()) {
      return { success: false, message: 'Please enter both email and password' };
    }
    if (accounts.some(acc => acc.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: 'This email already exists' };
    }
    const newStudent: UserAccount = { 
      email: email.trim(), 
      password: password.trim(), 
      role: 'student',
      approved: autoApprove
    };
    setAccounts(prev => [...prev, newStudent]);
    if (autoApprove) {
      return { success: true, message: `Student ${normalizedEmail} added and approved successfully!` };
    }
    return { success: true, message: `Student ${normalizedEmail} registered. Pending admin approval.` };
  };

  const deleteStudent = (email: string) => {
    setAccounts(prev => prev.filter(acc => acc.email !== email));
  };

  const approveStudent = (email: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.email === email ? { ...acc, approved: true } : acc
    ));
  };

  const rejectStudent = (email: string) => {
    setAccounts(prev => prev.filter(acc => acc.email !== email));
  };

  const getPendingStudents = () => {
    return accounts.filter(acc => acc.role === 'student' && !acc.approved);
  };

  const getApprovedStudents = () => {
    return accounts.filter(acc => acc.role === 'student' && acc.approved);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      accounts,
      login,
      logout,
      addStudent,
      deleteStudent,
      approveStudent,
      rejectStudent,
      getPendingStudents,
      getApprovedStudents,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
