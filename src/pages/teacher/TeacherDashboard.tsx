import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { TeacherClassSummary } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';

interface DashboardData {
  teacher: { teacherName: string };
  classes: TeacherClassSummary[];
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.teacherId) return;
    apiGet<DashboardData>('teacherDashboard', { teacherId: user.teacherId })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [user?.teacherId]);

  if (error) return <Banner kind="error">{error}</Banner>;
  if (!data) return <Spinner label="Loading your classes…" />;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Welcome, {data.teacher.teacherName}</h1>
        <p className="text-sm text-ink/60">Pick a class to take or review attendance.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.classes.map((cls) => (
          <Link
            to={`/teacher/classes/${cls.classId}`}
            key={cls.classId}
            className="card p-5 transition-colors hover:border-board"
          >
            <p className="font-serif text-lg text-ink">{cls.className}</p>
            <p className="mb-3 text-xs text-ink/50">{cls.semester} &middot; {cls.studentCount} students</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-pen-green">{cls.present} present</span>
              <span className="text-pen-red">{cls.absent} absent</span>
              <span className="ml-auto font-medium text-board">
                {cls.total === 0 ? '—' : `${cls.percentage}%`}
              </span>
            </div>
          </Link>
        ))}
        {data.classes.length === 0 && (
          <p className="text-sm text-ink/50">No classes assigned yet.</p>
        )}
      </div>
    </div>
  );
}
