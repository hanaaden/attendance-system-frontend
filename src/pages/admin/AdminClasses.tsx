import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import type { ClassItem, Department, Teacher, Student, Enrollment } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = { className: '', departmentId: '', teacherId: '', semester: '' };

export default function AdminClasses() {
  const [classes, setClasses] = useState<ClassItem[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [studentToEnroll, setStudentToEnroll] = useState('');

  async function load() {
    const res = await apiGet<{
      departments: Department[];
      classes: ClassItem[];
      teachers: Teacher[];
      students: Student[];
      enrollments: Enrollment[];
    }>('directory');
    setDepartments(res.departments.filter((d) => d.Status === 'ACTIVE'));
    setClasses(res.classes);
    setTeachers(res.teachers.filter((t) => t.Status === 'ACTIVE'));
    setStudents(res.students.filter((s) => s.Status === 'ACTIVE'));
    setEnrollments(res.enrollments);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      await apiPost('createClass', form);
      setForm(emptyForm);
      setNotice('Class created.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create class.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(item: ClassItem) {
    setError(null);
    try {
      await apiPost('updateClass', {
        classId: item.ClassID,
        status: item.Status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update class.');
    }
  }

  async function handleEnroll(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!selectedClass || !studentToEnroll) return;
    try {
      await apiPost('enrollStudent', { classId: selectedClass, studentId: studentToEnroll });
      setNotice('Student enrolled.');
      setStudentToEnroll('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not enroll student.');
    }
  }

  async function handleRemove(enrollmentId: string) {
    setError(null);
    try {
      await apiPost('removeEnrollment', { enrollmentId });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove enrollment.');
    }
  }

  const teacherName = (id: string) => teachers.find((t) => t.TeacherID === id)?.TeacherName || id;
  const studentName = (id: string) => students.find((s) => s.StudentID === id)?.StudentName || id;

  const roster = enrollments.filter(
    (en) => en.ClassID === selectedClass && en.Status === 'ACTIVE'
  );

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Classes</h1>
        <p className="text-sm text-ink/60">Create classes, assign a teacher, and manage rosters.</p>
      </header>

      <form onSubmit={handleCreate} className="card mb-8 grid gap-3 p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Class name</label>
          <input
            className="field"
            required
            value={form.className}
            onChange={(e) => setForm({ ...form, className: e.target.value })}
            placeholder="e.g. Algebra II"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Semester</label>
          <input
            className="field"
            required
            value={form.semester}
            onChange={(e) => setForm({ ...form, semester: e.target.value })}
            placeholder="e.g. Fall 2026"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Department</label>
          <select
            className="field"
            required
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
          >
            <option value="">Select…</option>
            {departments.map((d) => (
              <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Teacher</label>
          <select
            className="field"
            required
            value={form.teacherId}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
          >
            <option value="">Select…</option>
            {teachers.map((t) => (
              <option key={t.TeacherID} value={t.TeacherID}>{t.TeacherName}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Creating…' : 'Create class'}
          </button>
        </div>
      </form>

      {error && <div className="mb-4"><Banner kind="error">{error}</Banner></div>}
      {notice && <div className="mb-4"><Banner kind="success">{notice}</Banner></div>}

      {!classes ? (
        <Spinner label="Loading classes…" />
      ) : (
        <div className="card mb-8 overflow-x-auto">
          <table className="ledger">
            <thead>
              <tr>
                <th>ID</th>
                <th>Class</th>
                <th>Teacher</th>
                <th>Semester</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {classes.map((item) => (
                <tr
                  key={item.ClassID}
                  className={`cursor-pointer ${selectedClass === item.ClassID ? 'bg-[#F1EEE3]' : ''}`}
                  onClick={() => setSelectedClass(item.ClassID)}
                >
                  <td>{item.ClassID}</td>
                  <td>{item.ClassName}</td>
                  <td>{teacherName(item.TeacherID)}</td>
                  <td>{item.Semester}</td>
                  <td><StatusBadge value={item.Status} /></td>
                  <td>
                    <button
                      onClick={(evt) => {
                        evt.stopPropagation();
                        toggleStatus(item);
                      }}
                      className="btn btn-outline px-2.5 py-1 text-xs"
                    >
                      {item.Status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedClass && (
        <div>
          <h2 className="mb-3 font-serif text-lg text-ink">
            Roster &mdash; {classes?.find((c) => c.ClassID === selectedClass)?.ClassName}
          </h2>

          <form onSubmit={handleEnroll} className="mb-4 flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-ink">Enroll a student</label>
              <select
                className="field"
                value={studentToEnroll}
                onChange={(e) => setStudentToEnroll(e.target.value)}
              >
                <option value="">Select…</option>
                {students.map((s) => (
                  <option key={s.StudentID} value={s.StudentID}>{s.StudentName}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Enroll</button>
          </form>

          <div className="card overflow-x-auto">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Student</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {roster.map((en) => (
                  <tr key={en.EnrollmentID}>
                    <td>{studentName(en.StudentID)}</td>
                    <td>
                      <button
                        onClick={() => handleRemove(en.EnrollmentID)}
                        className="btn btn-outline px-2.5 py-1 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {roster.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center text-ink/50">No students enrolled yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
