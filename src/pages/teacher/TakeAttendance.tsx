import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { AttendanceRecord, AttendanceStatus, TeacherClassSummary } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TakeAttendance() {
  const { classId = '' } = useParams();
  const { user } = useAuth();
  const [cls, setCls] = useState<TeacherClassSummary | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState(today());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.teacherId) return;
    setLoading(true);
    try {
      const [dashboard, attendance] = await Promise.all([
        apiGet<{ classes: TeacherClassSummary[] }>('teacherDashboard', {
          teacherId: user.teacherId
        }),
        apiGet<{ attendance: AttendanceRecord[] }>('attendance', { classId, date })
      ]);
      setCls(dashboard.classes.find((c) => c.classId === classId) || null);
      setRecords(attendance.attendance);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the roster.');
    } finally {
      setLoading(false);
    }
  }, [classId, date, user?.teacherId]);

  useEffect(() => {
    load();
  }, [load]);

  async function mark(studentId: string, status: AttendanceStatus) {
    if (!user?.teacherId) return;
    setSavingId(studentId);
    setError(null);
    try {
      const existing = records.find((r) => r.StudentID === studentId);
      if (existing) {
        await apiPost('updateAttendance', { attendanceId: existing.AttendanceID, status });
      } else {
        await apiPost('attendance', {
          classId,
          studentId,
          status,
          recordedBy: user.teacherId,
          date
        });
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save attendance.');
    } finally {
      setSavingId(null);
    }
  }

  if (loading && !cls) return <Spinner label="Loading roster…" />;
  if (!cls) return <Banner kind="error">Class not found.</Banner>;

  return (
    <div>
      <Link to="/teacher" className="mb-4 inline-block text-sm text-board hover:underline">
        &larr; Back to my classes
      </Link>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">{cls.className}</h1>
          <p className="text-sm text-ink/60">{cls.semester} &middot; {cls.studentCount} students</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Date</label>
          <input
            type="date"
            className="field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </header>

      {error && <div className="mb-4"><Banner kind="error">{error}</Banner></div>}

      <div className="card overflow-x-auto">
        <table className="ledger">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cls.students.map((student) => {
              const record = records.find((r) => r.StudentID === student.StudentID);
              const busy = savingId === student.StudentID;
              return (
                <tr key={student.StudentID}>
                  <td>{student.StudentName}</td>
                  <td>{student.Email}</td>
                  <td>
                    {record ? (
                      <span
                        className={
                          record.Status === 'PRESENT' ? 'text-pen-green' : 'text-pen-red'
                        }
                      >
                        {record.Status}
                      </span>
                    ) : (
                      <span className="text-ink/40">Not recorded</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        disabled={busy}
                        onClick={() => mark(student.StudentID, 'PRESENT')}
                        className="btn btn-outline border-pen-green px-2.5 py-1 text-xs text-pen-green hover:bg-pen-green hover:text-chalk disabled:opacity-50"
                      >
                        Present
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => mark(student.StudentID, 'ABSENT')}
                        className="btn btn-outline border-pen-red px-2.5 py-1 text-xs text-pen-red hover:bg-pen-red hover:text-chalk disabled:opacity-50"
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {cls.students.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-ink/50">No students enrolled yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
