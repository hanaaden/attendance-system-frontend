import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import type { Department } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';
import StatusBadge from '../../components/StatusBadge';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[] | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const res = await apiGet<{ departments: Department[] }>('departments');
    setDepartments(res.departments);
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
      await apiPost('createDepartment', { departmentName: name });
      setName('');
      setNotice('Department created.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create department.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(dept: Department) {
    setError(null);
    try {
      await apiPost('updateDepartment', {
        departmentId: dept.DepartmentID,
        status: dept.Status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update department.');
    }
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Departments</h1>
        <p className="text-sm text-ink/60">Organize teachers, students and classes by department.</p>
      </header>

      <form onSubmit={handleCreate} className="card mb-8 flex items-end gap-3 p-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-ink">New department name</label>
          <input
            className="field"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mathematics"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Adding…' : 'Add department'}
        </button>
      </form>

      {error && <div className="mb-4"><Banner kind="error">{error}</Banner></div>}
      {notice && <div className="mb-4"><Banner kind="success">{notice}</Banner></div>}

      {!departments ? (
        <Spinner label="Loading departments…" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="ledger">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.DepartmentID}>
                  <td>{dept.DepartmentID}</td>
                  <td>{dept.DepartmentName}</td>
                  <td><StatusBadge value={dept.Status} /></td>
                  <td>
                    <button
                      onClick={() => toggleStatus(dept)}
                      className="btn btn-outline px-2.5 py-1 text-xs"
                    >
                      {dept.Status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
