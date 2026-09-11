import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import { login as apiLogin } from '../api/api';

export type UserRole =
  | 'ADMIN'
  | 'TEACHER'
  | 'STUDENT';

export interface User {
  userId: string;
  email: string;
  role: UserRole;
  teacherId?: string;
  studentId?: string;
  status?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginUser: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'attendance_user';

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser) as User;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  async function loginUser(
    email: string,
    password: string
  ) {
    setLoading(true);

    try {
      const result = await apiLogin(
        email.trim(),
        password
      );

      if (
        result.status !== 'success' ||
        !result.user
      ) {
        throw new Error(
          result.message || 'Login failed.'
        );
      }

      setUser(result.user);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}