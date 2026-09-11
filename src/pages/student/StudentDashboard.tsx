import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { StudentClassSummary } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';

interface DashboardData {
  student: { studentName: string };
  summary: { total: number; present: number; absent: number; percentage: number };
  classes: StudentClassSummary[];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.studentId) return;
    apiGet<DashboardData>('studentDashboard', { studentId: user.studentId })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [user?.studentId]);

  if (error) return <Banner kind="error">{error}</Banner>;
  if (!data) return <Spinner label="Loading your attendance…" />;

  const { summary } = data;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Hi, {data.student.studentName}</h1>
        <p className="text-sm text-ink/60">Here's how your attendance looks across all classes.</p>
      </header>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <p className="font-serif text-2xl text-board">{summary.total}</p>
          <p className="mt-1 text-xs text-ink/60">Sessions logged</p>
        </div>
        <div className="card p-4">
          <p className="font-serif text-2xl text-pen-green">{summary.present}</p>
          <p className="mt-1 text-xs text-ink/60">Present</p>
        </div>
        <div className="card p-4">
          <p className="font-serif text-2xl text-pen-red">{summary.absent}</p>
          <p className="mt-1 text-xs text-ink/60">Absent</p>
        </div>
        <div className="card p-4">
          <p className="font-serif text-2xl text-board">
            {summary.total === 0 ? '—' : `${summary.percentage}%`}
          </p>
          <p className="mt-1 text-xs text-ink/60">Overall rate</p>
        </div>
      </div>

      <h2 className="mb-3 font-serif text-lg text-ink">By class</h2>
      <div className="card overflow-x-auto">
        <table className="ledger">
          <thead>
            <tr>
              <th>Class</th>
              <th>Semester</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.classes.map((cls) => (
              <tr key={cls.classId}>
                <td>{cls.className}</td>
                <td>{cls.semester}</td>
                <td>{cls.present}</td>
                <td>{cls.absent}</td>
                <td>{cls.total === 0 ? '—' : `${cls.percentage}%`}</td>
              </tr>
            ))}
            {data.classes.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-ink/50">Not enrolled in any classes yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
