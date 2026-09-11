import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';
import type { AdminSummary, StudentAttendanceSummary, Teacher, ClassItem } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';

interface DashboardData {
  summary: AdminSummary;
  studentAttendance: StudentAttendanceSummary[];
  teachers: Teacher[];
  classes: ClassItem[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<DashboardData>('adminDashboard')
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <Banner kind="error">{error}</Banner>;
  if (!data) return <Spinner label="Loading overview…" />;

  const { summary } = data;

  const cards = [
    { label: 'Active students', value: summary.totalStudents },
    { label: 'Active teachers', value: summary.totalTeachers },
    { label: 'Active classes', value: summary.totalClasses },
    { label: 'Attendance rate', value: `${summary.attendanceRate}%` }
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Overview</h1>
        <p className="text-sm text-ink/60">
          {summary.totalAttendanceRecords} records logged &middot; {summary.present} present,{' '}
          {summary.absent} absent
        </p>
      </header>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-4">
            <p className="font-serif text-2xl text-board">{card.value}</p>
            <p className="mt-1 text-xs text-ink/60">{card.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-serif text-lg text-ink">Attendance by student</h2>
      <div className="card overflow-x-auto">
        <table className="ledger">
          <thead>
            <tr>
              <th>Student</th>
              <th>Department</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.studentAttendance.map((row) => (
              <tr key={row.studentId}>
                <td>{row.studentName}</td>
                <td>{row.departmentId}</td>
                <td>{row.present}</td>
                <td>{row.absent}</td>
                <td>{row.total === 0 ? '—' : `${row.percentage}%`}</td>
              </tr>
            ))}
            {data.studentAttendance.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-ink/50">
                  No students yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
