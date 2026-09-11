import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  excused: number;
  percentage: number;
}

interface StudentCourseSummary {
  offeringId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  classId: string;
  className: string;
  teacherId: string;
  present: number;
  absent: number;
  excused: number;
  total: number;
  percentage: number;
}

interface DashboardData {
  student: {
    studentId: string;
    studentName: string;
    email: string;
    departmentId: string;
    classId: string;
    className: string;
    status: string;
  };

  class: {
    ClassID?: string;
    ClassName?: string;
    DepartmentID?: string;
    Semester?: string;
    Status?: string;
  } | null;

  overall: AttendanceSummary;

  totals: AttendanceSummary;

  courses: StudentCourseSummary[];

  attendance: unknown[];

  excuseRequests: unknown[];
}

export default function StudentDashboard() {
  const { user } = useAuth();

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!user?.studentId) {
      return;
    }

    setError(null);

    apiGet<DashboardData>(
      'studentDashboard',
      {
        studentId: user.studentId
      }
    )
      .then((result) => {
        console.log(
          'STUDENT DASHBOARD RESPONSE:',
          result
        );

        setData(result);
      })
      .catch((err) => {
        console.error(
          'STUDENT DASHBOARD ERROR:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load attendance.'
        );
      });
  }, [user?.studentId]);

  if (error) {
    return (
      <Banner kind="error">
        {error}
      </Banner>
    );
  }

  if (!data) {
    return (
      <Spinner label="Loading your attendance…" />
    );
  }

  const summary = data.overall;

  return (
    <div>
      {/* HEADER */}

      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">
          Hi, {data.student.studentName}
        </h1>

        <p className="text-sm text-ink/60">
          Here's how your attendance looks across
          your courses.
        </p>
      </header>

      {/* SUMMARY */}

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">

        {/* TOTAL */}

        <div className="card p-4">
          <p className="font-serif text-2xl text-board">
            {summary.total}
          </p>

          <p className="mt-1 text-xs text-ink/60">
            Sessions logged
          </p>
        </div>

        {/* PRESENT */}

        <div className="card p-4">
          <p className="font-serif text-2xl text-pen-green">
            {summary.present}
          </p>

          <p className="mt-1 text-xs text-ink/60">
            Present
          </p>
        </div>

        {/* ABSENT */}

        <div className="card p-4">
          <p className="font-serif text-2xl text-pen-red">
            {summary.absent}
          </p>

          <p className="mt-1 text-xs text-ink/60">
            Absent
          </p>
        </div>

        {/* OVERALL RATE */}

        <div className="card p-4">
          <p className="font-serif text-2xl text-board">
            {summary.total === 0
              ? '—'
              : `${summary.percentage}%`}
          </p>

          <p className="mt-1 text-xs text-ink/60">
            Overall rate
          </p>
        </div>
      </div>

      {/* COURSES */}

      <h2 className="mb-3 font-serif text-lg text-ink">
        By course
      </h2>

      <div className="card overflow-x-auto">
        <table className="ledger">
          <thead>
            <tr>
              <th>Course</th>
              <th>Class</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Rate</th>
            </tr>
          </thead>

          <tbody>
            {data.courses.map((course) => (
              <tr
                key={course.offeringId}
              >
                <td>
                  <div>
                    <p className="font-medium text-ink">
                      {course.courseName}
                    </p>

                    {course.courseCode && (
                      <p className="text-xs text-ink/50">
                        {course.courseCode}
                      </p>
                    )}
                  </div>
                </td>

                <td>
                  {course.className}
                </td>

                <td>
                  {course.present}
                </td>

                <td>
                  {course.absent}
                </td>

                <td>
                  {course.total === 0
                    ? '—'
                    : `${course.percentage}%`}
                </td>
              </tr>
            ))}

            {data.courses.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-ink/50"
                >
                  No course attendance records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}