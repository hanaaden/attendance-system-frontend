import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import type { Course, Department } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';
import StatusBadge from '../../components/StatusBadge';

type CourseForm = {
  courseCode: string;
  courseName: string;
  departmentId: string;
};

const emptyForm = (): CourseForm => ({
  courseCode: '',
  courseName: '',
  departmentId: ''
});

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState<CourseForm>(emptyForm());
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [coursesRes, departmentsRes] = await Promise.all([
      apiGet<{ courses: Course[] }>('courses'),
      apiGet<{ departments: Department[] }>('departments')
    ]);

    setCourses(coursesRes.courses);
    setDepartments(departmentsRes.departments.filter((dep) => dep.status === 'ACTIVE'));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Could not load courses.'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      if (editingCourseId) {
        await apiPost('updateCourse', {
          courseId: editingCourseId,
          courseCode: form.courseCode,
          courseName: form.courseName,
          departmentId: form.departmentId
        });
        setNotice('Course updated.');
      } else {
        await apiPost('createCourse', {
          courseCode: form.courseCode,
          courseName: form.courseName,
          departmentId: form.departmentId
        });
        setNotice('Course created.');
      }

      setForm(emptyForm());
      setEditingCourseId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save course.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(course: Course) {
    setError(null);
    try {
      await apiPost('updateCourse', {
        courseId: course.courseId,
        status: course.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update course.');
    }
  }

  function editCourse(course: Course) {
    setEditingCourseId(course.courseId);
    setForm({
      courseCode: course.courseCode,
      courseName: course.courseName,
      departmentId: course.departmentId
    });
    setNotice(null);
    setError(null);
  }

  function cancelEdit() {
    setEditingCourseId(null);
    setForm(emptyForm());
  }

  const departmentName = (departmentId: string) =>
    departments.find((dep) => dep.departmentId === departmentId)?.departmentName ?? departmentId;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Courses</h1>
        <p className="text-sm text-ink/60">Manage course catalog entries and department assignments.</p>
      </header>

      <form onSubmit={handleSubmit} className="card mb-8 grid gap-3 p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Course code</label>
          <input
            className="field"
            required
            value={form.courseCode}
            onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
            placeholder="e.g. ECO101"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Course name</label>
          <input
            className="field"
            required
            value={form.courseName}
            onChange={(e) => setForm({ ...form, courseName: e.target.value })}
            placeholder="e.g. Microeconomics"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">Department</label>
          <select
            className="field"
            required
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
          >
            <option value="">Select…</option>
            {departments.map((dep) => (
              <option key={dep.departmentId} value={dep.departmentId}>
                {dep.departmentName}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? (editingCourseId ? 'Saving…' : 'Creating…') : editingCourseId ? 'Save changes' : 'Create course'}
          </button>
          {editingCourseId && (
            <button type="button" onClick={cancelEdit} className="btn btn-outline">
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mb-4">
          <Banner kind="error">{error}</Banner>
        </div>
      )}
      {notice && (
        <div className="mb-4">
          <Banner kind="success">{notice}</Banner>
        </div>
      )}

      {!courses ? (
        <Spinner label="Loading courses…" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="ledger">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.courseId}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseName}</td>
                  <td>{departmentName(course.departmentId)}</td>
                  <td>
                    <StatusBadge value={course.status} />
                  </td>
                  <td className="space-x-2">
                    <button
                      type="button"
                      onClick={() => editCourse(course)}
                      className="btn btn-outline px-2.5 py-1 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(course)}
                      className="btn btn-outline px-2.5 py-1 text-xs"
                    >
                      {course.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
