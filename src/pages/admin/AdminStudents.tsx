import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import type { ClassItem, Department, Student } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = {
  studentName: '',
  email: '',
  departmentId: '',
  classId: '',
  password: ''
};

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const res = await apiGet<{
      students: Student[];
      departments: Department[];
      classes: ClassItem[];
    }>('directory');

    setStudents(res.students);
    setDepartments(res.departments.filter((dep) => dep.status === 'ACTIVE'));
    setClasses(res.classes.filter((item) => item.status === 'ACTIVE'));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Could not load students.'));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      await apiPost('createStudent', form);
      setForm(emptyForm);
      setNotice('Student account created.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create student.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(student: Student) {
    setError(null);
    try {
      await apiPost('updateStudent', {
        studentId: student.studentId,
        status: student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update student.');
    }
  }

  const departmentName = (departmentId: string) =>
    departments.find((dep) => dep.departmentId === departmentId)?.departmentName ?? departmentId;

  const className = (classId: string) =>
    classes.find((item) => item.classId === classId)?.className ?? classId;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Students</h1>
        <p className="text-sm text-ink/60">Create student accounts, assign them to a class, and manage status.</p>
      </header>

      <form onSubmit={handleCreate} className="card mb-8 grid gap-3 p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Full name</label>
          <input
            className="field"
            required
            value={form.studentName}
            onChange={(e) => setForm({ ...form, studentName: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Email</label>
          <input
            type="email"
            className="field"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Class</label>
          <select
            className="field"
            required
            value={form.classId}
            onChange={(e) => setForm({ ...form, classId: e.target.value })}
          >
            <option value="">Select…</option>
            {classes.map((item) => (
              <option key={item.classId} value={item.classId}>
                {item.className}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">Temporary password</label>
          <input
            type="password"
            className="field"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Creating…' : 'Create student'}
          </button>
        </div>
      </form>

      {error && <div className="mb-4"><Banner kind="error">{error}</Banner></div>}
      {notice && <div className="mb-4"><Banner kind="success">{notice}</Banner></div>}

      {!students ? (
        <Spinner label="Loading students…" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="ledger">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Class</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.studentId}>
                  <td>{student.studentId}</td>
                  <td>{student.studentName}</td>
                  <td>{student.email}</td>
                  <td>{departmentName(student.departmentId)}</td>
                  <td>{className(student.classId)}</td>
                  <td><StatusBadge value={student.status} /></td>
                  <td>
                    <button
                      onClick={() => toggleStatus(student)}
                      className="btn btn-outline px-2.5 py-1 text-xs"
                    >
                      {student.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
