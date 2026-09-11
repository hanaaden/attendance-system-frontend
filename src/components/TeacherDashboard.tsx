import {
  useEffect,
  useState,
} from 'react';

import {
  useAuth,
} from '../context/AuthContext';

import {
  getTeacherDashboard,
  getClassAttendance,
  getAttendance,
  apiPost,
} from '../api/api';

import type {
  Attendance,
  TeacherClass,
} from '../types';


export default function TeacherDashboard() {

  const {
    user,
    logout,
  } = useAuth();

  const teacherId =
    user?.teacherId || '';


  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [classes, setClasses] =
    useState<TeacherClass[]>([]);

  const [teacher, setTeacher] =
    useState<{
      teacherName: string;
      email: string;
    } | null>(null);

  const [selectedClass, setSelectedClass] =
    useState<TeacherClass | null>(null);

  const [attendance, setAttendance] =
    useState<Attendance[]>([]);

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    );

  const [saving, setSaving] =
    useState(false);


  async function loadDashboard() {

    if (!teacherId) {

      setError(
        'Teacher account is missing TeacherID.'
      );

      setLoading(false);

      return;
    }

    try {

      const result =
        await getTeacherDashboard(
          teacherId
        );

      setClasses(
        result.classes
      );

      setTeacher({
        teacherName:
          result.teacher.teacherName,
        email:
          result.teacher.email,
      });

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load teacher dashboard.'
      );

    } finally {

      setLoading(false);
    }
  }


  useEffect(() => {
    loadDashboard();
  }, [teacherId]);


  async function openClass(
    classItem: TeacherClass
  ) {

    setSelectedClass(
      classItem
    );

    try {

      const result =
        await getClassAttendance(
          classItem.classId
        );

      setAttendance(
        result.attendance
      );

    } catch (error) {

      window.alert(
        error instanceof Error
          ? error.message
          : 'Failed to load attendance.'
      );
    }
  }


  async function markAttendance(
    studentId: string,
    status: 'PRESENT' | 'ABSENT'
  ) {

    if (!selectedClass) return;

    setSaving(true);

    try {

      await apiPost(
        'attendance',
        {
          classId:
            selectedClass.classId,

          studentId,

          status,

          recordedBy:
            teacherId,

          date,
        }
      );

      const result =
        await getClassAttendance(
          selectedClass.classId
        );

      setAttendance(
        result.attendance
      );

    } catch (error) {

      window.alert(
        error instanceof Error
          ? error.message
          : 'Failed to record attendance.'
      );

    } finally {

      setSaving(false);
    }
  }


  if (loading) {

    return (
      <div className="loading-page">
        Loading teacher dashboard...
      </div>
    );
  }


  if (error) {

    return (
      <main className="page">

        <div className="error-card">

          <h2>
            Teacher dashboard error
          </h2>

          <p>
            {error}
          </p>

          <button
            className="secondary-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </main>
    );
  }


  return (
    <div className="app-shell">

      <aside className="sidebar">

        <div className="sidebar-brand">
          ATTENDANCE
        </div>

        <div className="sidebar-user">

          <strong>
            {teacher?.teacherName}
          </strong>

          <span>
            Teacher
          </span>

        </div>

        <nav>

          <button
            className="nav-button active"
          >
            My Classes
          </button>

        </nav>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>

      </aside>


      <main className="main-content">

        <header className="topbar">

          <div>

            <h1>
              Teacher Dashboard
            </h1>

            <p>
              Manage your assigned classes and attendance.
            </p>

          </div>

          <button
            className="secondary-button"
            onClick={loadDashboard}
          >
            Refresh
          </button>

        </header>


        <section>

          <div className="section-heading">

            <div>

              <h2>
                My Classes
              </h2>

              <p>
                Only classes assigned to you are shown.
              </p>

            </div>

          </div>


          <div className="teacher-class-grid">

            {classes.map(
              classItem => (

                <button
                  key={
                    classItem.classId
                  }
                  className={
                    selectedClass?.classId ===
                    classItem.classId
                      ? 'class-card selected'
                      : 'class-card'
                  }
                  onClick={() =>
                    openClass(
                      classItem
                    )
                  }
                >

                  <span>
                    {classItem.classId}
                  </span>

                  <h3>
                    {classItem.className}
                  </h3>

                  <p>
                    {classItem.studentCount}
                    {' '}
                    students
                  </p>

                  <strong>
                    {classItem.percentage}%
                  </strong>

                </button>

              )
            )}

          </div>

        </section>


        {selectedClass && (

          <section className="panel">

            <div className="panel-header">

              <div>

                <h2>
                  {selectedClass.className}
                </h2>

                <p>
                  Mark attendance for enrolled students.
                </p>

              </div>

              <div className="field compact">

                <label>
                  Attendance Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Current Status</th>
                    <th>Attendance</th>
                  </tr>

                </thead>

                <tbody>

                  {selectedClass.students.map(
                    student => {

                      const existing =
                        attendance.find(
                          record =>
                            record.StudentID ===
                              student.StudentID &&
                            record.Date
                              .toString()
                              .startsWith(
                                date
                              )
                        );

                      return (

                        <tr
                          key={
                            student.StudentID
                          }
                        >

                          <td>
                            <strong>
                              {student.StudentName}
                            </strong>
                          </td>

                          <td>
                            {student.StudentID}
                          </td>

                          <td>

                            {existing ? (
                              <StatusBadge
                                status={
                                  existing.Status
                                }
                              />
                            ) : (
                              <span className="muted">
                                Not recorded
                              </span>
                            )}

                          </td>

                          <td>

                            <div className="attendance-actions">

                              <button
                                className="present-button"
                                disabled={
                                  saving ||
                                  Boolean(existing)
                                }
                                onClick={() =>
                                  markAttendance(
                                    student.StudentID,
                                    'PRESENT'
                                  )
                                }
                              >
                                Present
                              </button>

                              <button
                                className="absent-button"
                                disabled={
                                  saving ||
                                  Boolean(existing)
                                }
                                onClick={() =>
                                  markAttendance(
                                    student.StudentID,
                                    'ABSENT'
                                  )
                                }
                              >
                                Absent
                              </button>

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}


function StatusBadge({
  status,
}: {
  status: string;
}) {

  return (
    <span
      className={
        status === 'PRESENT'
          ? 'status-badge positive'
          : 'status-badge negative'
      }
    >
      {status}
    </span>
  );
}