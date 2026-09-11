import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import type { AttendanceRecord, AttendanceStatus, ClassItem, Course, CourseOffering, Student, Teacher } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';
import StatusBadge from '../../components/StatusBadge';

export default function AdminAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [filter, setFilter] = useState({
    date: '',
    studentId: '',
    classId: '',
    courseId: '',
    teacherId: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [attendanceRes, directoryRes] = await Promise.all([
        apiGet<{ attendance: AttendanceRecord[] }>('attendance'),
        apiGet<{ classes: ClassItem[]; students: Student[]; teachers: Teacher[]; courses: Course[]; courseOfferings: CourseOffering[] }>('directory')
      ]);

      setAttendance(attendanceRes.attendance ?? []);
      setClasses(directoryRes.classes ?? []);
      setStudents(directoryRes.students ?? []);
      setTeachers(directoryRes.teachers ?? []);
      setCourses(directoryRes.courses ?? []);
      setOfferings(directoryRes.courseOfferings ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load attendance.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredRecords = useMemo(() => {
    return attendance.filter((record) => {
      const matchesDate = filter.date ? record.date === filter.date : true;
      const matchesStudent = filter.studentId ? record.studentId === filter.studentId : true;
      const matchesClass = filter.classId ? record.classId === filter.classId : true;
      const matchesCourse = filter.courseId ? record.courseId === filter.courseId : true;
      const matchesTeacher = filter.teacherId
        ? offerings.find((offering) => offering.offeringId === record.offeringId)?.teacherId === filter.teacherId
        : true;

      return matchesDate && matchesStudent && matchesClass && matchesCourse && matchesTeacher;
    });
  }, [attendance, classes, courses, filter, offerings]);

  async function updateAttendance(attendanceId: string, status: AttendanceStatus) {
    try {
      await apiPost('updateAttendance', { attendanceId, status });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update attendance.');
    }
  }

  const courseName = (courseId: string) =>
    courses.find((course) => course.courseId === courseId)?.courseName ?? courseId;
  const className = (classId: string) =>
    classes.find((item) => item.classId === classId)?.className ?? classId;
  const teacherName = (offeringId: string) => {
    const offering = offerings.find((item) => item.offeringId === offeringId);
    if (!offering) return offeringId;
    return teachers.find((teacher) => teacher.teacherId === offering.teacherId)?.teacherName ?? offering.teacherId;
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Attendance</h1>
        <p className="text-sm text-ink/60">Review and correct attendance records by course, class, and date.</p>
      </header>

      <div className="card mb-6 grid gap-3 p-4 md:grid-cols-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Date</label>
          <input
            type="date"
            className="field"
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Student</label>
          <select
            className="field"
            value={filter.studentId}
            onChange={(e) => setFilter({ ...filter, studentId: e.target.value })}
          >
            <option value="">All</option>
            {students.map((student) => (
              <option key={student.studentId} value={student.studentId}>
                {student.studentName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Class</label>
          <select
            className="field"
            value={filter.classId}
            onChange={(e) => setFilter({ ...filter, classId: e.target.value })}
          >
            <option value="">All</option>
            {classes.map((item) => (
              <option key={item.classId} value={item.classId}>
                {item.className}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Course</label>
          <select
            className="field"
            value={filter.courseId}
            onChange={(e) => setFilter({ ...filter, courseId: e.target.value })}
          >
            <option value="">All</option>
            {courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Teacher</label>
          <select
            className="field"
            value={filter.teacherId}
            onChange={(e) => setFilter({ ...filter, teacherId: e.target.value })}
          >
            <option value="">All</option>
            {teachers.map((teacher) => (
              <option key={teacher.teacherId} value={teacher.teacherId}>
                {teacher.teacherName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Banner kind="error">{error}</Banner>
        </div>
      )}

      {loading ? (
        <Spinner label="Loading attendance…" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="ledger">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Course</th>
                <th>Class</th>
                <th>Teacher</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.attendanceId}>
                  <td>{record.date}</td>
                  <td>{record.studentName}</td>
                  <td>{courseName(record.courseId)}</td>
                  <td>{className(record.classId)}</td>
                  <td>{teacherName(record.offeringId)}</td>
                  <td>
                    <StatusBadge value={record.status} />
                  </td>
                  <td>
                    <select
                      className="field min-w-[120px]"
                      value={record.status}
                      onChange={(e) => updateAttendance(record.attendanceId, e.target.value as AttendanceStatus)}
                    >
                      <option value="PRESENT">PRESENT</option>
                      <option value="ABSENT">ABSENT</option>
                      <option value="EXCUSED">EXCUSED</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-ink/50">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
