import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { CourseOffering } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';

interface DashboardData {
  teacher: { teacherName: string };
  offerings: CourseOffering[];
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.teacherId) return;
    apiGet<DashboardData>('teacherDashboard', { teacherId: user.teacherId })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load offerings.'));
  }, [user?.teacherId]);

  if (error) return <Banner kind="error">{error}</Banner>;
  if (!data) return <Spinner label="Loading your course offerings…" />;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Welcome, {data.teacher.teacherName}</h1>
        <p className="text-sm text-ink/60">Select an offering to take or review attendance.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.offerings.map((offering) => (
          <Link
            to={`/teacher/offerings/${offering.offeringId}`}
            key={offering.offeringId}
            className="card p-5 transition-colors hover:border-board"
          >
            <p className="font-serif text-lg text-ink">
              {offering.courseName ?? offering.courseId}
            </p>
            <p className="mb-3 text-xs text-ink/50">
              {offering.className ?? offering.classId} &middot; {offering.semester}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/70">Teacher: {offering.teacherName ?? offering.teacherId}</span>
              <span className="font-medium text-board">Open</span>
            </div>
          </Link>
        ))}
        {data.offerings.length === 0 && (
          <p className="text-sm text-ink/50">No course offerings assigned yet.</p>
        )}
      </div>
    </div>
  );
}
