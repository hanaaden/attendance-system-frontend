import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import type { Department, Teacher } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = { teacherName: '', email: '', departmentId: '', password: '' };

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const res = await apiGet<{ teachers: Teacher[]; departments: Department[] }>('directory');
    setTeachers(res.teachers);
    setDepartments(res.departments.filter((dep) => dep.status === 'ACTIVE'));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Could not load teachers.'));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      await apiPost('createTeacher', form);
      setForm(emptyForm);
      setNotice('Teacher account created.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create teacher.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(teacher: Teacher) {
    setError(null);
    try {
      await apiPost('updateTeacher', {
        teacherId: teacher.teacherId,
        status: teacher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update teacher.');
    }
  }

  const departmentName = (departmentId: string) =>
    departments.find((dep) => dep.departmentId === departmentId)?.departmentName ?? departmentId;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Teachers</h1>
        <p className="text-sm text-ink/60">Create teacher accounts and assign them to departments.</p>
      </header>

      <form onSubmit={handleCreate} className="card mb-8 grid gap-3 p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Full name</label>
          <input
            className="field"
            required
            value={form.teacherName}
            onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
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
            {submitting ? 'Creating…' : 'Create teacher'}
          </button>
        </div>
      </form>

      {error && <div className="mb-4"><Banner kind="error">{error}</Banner></div>}
      {notice && <div className="mb-4"><Banner kind="success">{notice}</Banner></div>}

      {!teachers ? (
        <Spinner label="Loading teachers…" />
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
              {teachers.map((teacher) => (
                <tr key={teacher.teacherId}>
                  <td>{teacher.teacherId}</td>
                  <td>{teacher.teacherName}</td>
                  <td>{teacher.email}</td>
                  <td>{departmentName(teacher.departmentId)}</td>
                  <td><StatusBadge value={teacher.status} /></td>
                  <td>
                    <button
                      onClick={() => toggleStatus(teacher)}
                      className="btn btn-outline px-2.5 py-1 text-xs"
                    >
                      {teacher.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
