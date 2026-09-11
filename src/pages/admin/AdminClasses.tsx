import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import type { ClassItem, Department, Student } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = {
  className: '',
  departmentId: '',
  semester: ''
};

export default function AdminClasses() {
  const [classes, setClasses] = useState<ClassItem[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');

  async function load() {
    const res = await apiGet<{
      departments: Department[];
      classes: ClassItem[];
      students: Student[];
    }>('directory');

    setDepartments(res.departments.filter((d) => d.status === 'ACTIVE'));
    setClasses(res.classes);
    setStudents(res.students.filter((s) => s.status === 'ACTIVE'));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Could not load classes.'));
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
        classId: item.classId,
        status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update class.');
    }
  }

  const departmentName = (departmentId: string) =>
    departments.find((dep) => dep.departmentId === departmentId)?.departmentName ?? departmentId;

  const roster = students.filter((student) => student.classId === selectedClass);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Classes</h1>
        <p className="text-sm text-ink/60">Create classes and view each class roster by student.</p>
      </header>

      <form onSubmit={handleCreate} className="card mb-8 grid gap-3 p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Class name</label>
          <input
            className="field"
            required
            value={form.className}
            onChange={(e) => setForm({ ...form, className: e.target.value })}
            placeholder="e.g. 4C"
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
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">Semester</label>
          <input
            className="field"
            required
            value={form.semester}
            onChange={(e) => setForm({ ...form, semester: e.target.value })}
            placeholder="e.g. 2026-1"
          />
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
                <th>Department</th>
                <th>Semester</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {classes.map((item, index) => (
                <tr
                  key={item.classId ?? item.className ?? `class-${index}`}
                  className={`cursor-pointer ${selectedClass === item.classId ? 'bg-[#F1EEE3]' : ''}`}
                  onClick={() => setSelectedClass(item.classId)}
                >
                  <td>{item.classId}</td>
                  <td>{item.className}</td>
                  <td>{departmentName(item.departmentId)}</td>
                  <td>{item.semester}</td>
                  <td><StatusBadge value={item.status} /></td>
                  <td>
                    <button
                      onClick={(evt) => {
                        evt.stopPropagation();
                        toggleStatus(item);
                      }}
                      className="btn btn-outline px-2.5 py-1 text-xs"
                    >
                      {item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
            Roster &mdash; {classes?.find((c) => c.classId === selectedClass)?.className}
          </h2>

          <div className="card overflow-x-auto">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((student, index) => (
                  <tr key={student.studentId ?? student.email ?? `roster-student-${index}`}>
                    <td>{student.studentName}</td>
                    <td>{student.email}</td>
                    <td><StatusBadge value={student.status} /></td>
                  </tr>
                ))}
                {roster.length === 0 && (
                  <tr key="empty-roster">
                    <td colSpan={3} className="text-center text-ink/50">
                      No students assigned to this class yet.
                    </td>
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
