import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import type { Student, Department } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = { studentName: '', email: '', departmentId: '', password: '' };

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [s, d] = await Promise.all([
      apiGet<{ students: Student[] }>('students'),
      apiGet<{ departments: Department[] }>('departments')
    ]);
    setStudents(s.students);
    setDepartments(d.departments.filter((dep) => dep.Status === 'ACTIVE'));
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
        studentId: student.StudentID,
        status: student.Status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update student.');
    }
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Students</h1>
        <p className="text-sm text-ink/60">Create student accounts and assign them to departments.</p>
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
              <option key={d.DepartmentID} value={d.DepartmentID}>
                {d.DepartmentName}
              </option>
            ))}
          </select>
        </div>
        <div>
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
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.StudentID}>
                  <td>{student.StudentID}</td>
                  <td>{student.StudentName}</td>
                  <td>{student.Email}</td>
                  <td>{student.DepartmentID}</td>
                  <td><StatusBadge value={student.Status} /></td>
                  <td>
                    <button
                      onClick={() => toggleStatus(student)}
                      className="btn btn-outline px-2.5 py-1 text-xs"
                    >
                      {student.Status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
