import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { AttendanceRecord, AttendanceStatus, ClassItem, Course, CourseOffering, Student } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TakeAttendance() {
  const { offeringId = '' } = useParams();
  const { user } = useAuth();
  const [selectedOffering, setSelectedOffering] = useState<CourseOffering | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [date, setDate] = useState(today());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user?.teacherId) return;
      setLoading(true);
      try {
        const [dashboard, directory, attendance] = await Promise.all([
          apiGet<{ teacher: { teacherName: string }; offerings: CourseOffering[] }>('teacherDashboard', {
            teacherId: user.teacherId
          }),
          apiGet<{ students: Student[]; classes: ClassItem[]; courses: Course[] }>('directory'),
          apiGet<{ attendance: AttendanceRecord[] }>('attendance', { offeringId, date })
        ]);

        const nextOfferings = dashboard.offerings ?? [];
        const currentOffering = nextOfferings.find((offering) => offering.offeringId === offeringId) ?? null;
        setSelectedOffering(currentOffering);

        const classId = currentOffering?.classId ?? '';
        setClasses(directory.classes ?? []);
        setCourses(directory.courses ?? []);
        setStudents((directory.students ?? []).filter((student) => student.classId === classId));
        setRecords(attendance.attendance ?? []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load the roster.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [date, offeringId, user?.teacherId]);

  async function mark(studentId: string, status: AttendanceStatus) {
    if (!selectedOffering || !user?.teacherId) return;
    setSavingId(studentId);
    setError(null);
    try {
      const student = students.find((item) => item.studentId === studentId);
      const existing = records.find((record) => record.studentId === studentId);

      if (existing) {
        await apiPost('updateAttendance', { attendanceId: existing.attendanceId, status });
      } else {
        await apiPost('recordAttendance', {
          offeringId: selectedOffering.offeringId,
          classId: selectedOffering.classId,
          courseId: selectedOffering.courseId,
          studentId,
          studentName: student?.studentName ?? '',
          date,
          status,
          recordedBy: user.teacherId
        });
      }

      const refreshed = await apiGet<{ attendance: AttendanceRecord[] }>('attendance', { offeringId, date });
      setRecords(refreshed.attendance ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save attendance.');
    } finally {
      setSavingId(null);
    }
  }

  const currentClass = classes.find((item) => item.classId === selectedOffering?.classId)?.className ?? selectedOffering?.classId;
  const currentCourse = courses.find((course) => course.courseId === selectedOffering?.courseId)?.courseName ?? selectedOffering?.courseId;

  if (!selectedOffering && !loading) {
    return (
      <div>
        <Link to="/teacher" className="mb-4 inline-block text-sm text-board hover:underline">
          &larr; Back to my offerings
        </Link>
        <div className="card p-6">
          <p className="text-sm text-ink/60">No offering found.</p>
        </div>
      </div>
    );
  }

  if (loading && !selectedOffering) return <Spinner label="Loading roster…" />;

  return (
    <div>
      <Link to="/teacher" className="mb-4 inline-block text-sm text-board hover:underline">
        &larr; Back to my offerings
      </Link>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">{currentCourse}</h1>
          <p className="text-sm text-ink/60">
            {currentClass} &middot; {selectedOffering?.semester}
          </p>
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

      {error && (
        <div className="mb-4">
          <Banner kind="error">{error}</Banner>
        </div>
      )}

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
            {students.map((student) => {
              const record = records.find((item) => item.studentId === student.studentId);
              const busy = savingId === student.studentId;
              return (
                <tr key={student.studentId}>
                  <td>{student.studentName}</td>
                  <td>{student.email}</td>
                  <td>
                    {record ? (
                      <span
                        className={
                          record.status === 'PRESENT'
                            ? 'text-pen-green'
                            : record.status === 'EXCUSED'
                            ? 'text-board'
                            : 'text-pen-red'
                        }
                      >
                        {record.status}
                      </span>
                    ) : (
                      <span className="text-ink/40">Not recorded</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        disabled={busy}
                        onClick={() => mark(student.studentId, 'PRESENT')}
                        className="btn btn-outline border-pen-green px-2.5 py-1 text-xs text-pen-green hover:bg-pen-green hover:text-chalk disabled:opacity-50"
                      >
                        Present
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => mark(student.studentId, 'ABSENT')}
                        className="btn btn-outline border-pen-red px-2.5 py-1 text-xs text-pen-red hover:bg-pen-red hover:text-chalk disabled:opacity-50"
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-ink/50">
                  No students assigned to this class yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
