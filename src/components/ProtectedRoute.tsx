import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import Spinner from './Spinner';

interface Props {
  allow: Role[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allow, children }: Props) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner label="Checking session…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;

  return <>{children}</>;
}

export function homeFor(role: Role): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'TEACHER') return '/teacher';
  return '/student';
}
