import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import type { ClassItem, Course, CourseOffering, Department, Teacher } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';
import StatusBadge from '../../components/StatusBadge';

type CourseOfferingForm = {
  courseId: string;
  classId: string;
  teacherId: string;
  semester: string;
};

const emptyForm = (): CourseOfferingForm => ({
  courseId: '',
  classId: '',
  teacherId: '',
  semester: ''
});

export default function AdminCourseOfferings() {
  const [offerings, setOfferings] = useState<CourseOffering[] | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState<CourseOfferingForm>(emptyForm());
  const [editingOfferingId, setEditingOfferingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const directoryRes = await apiGet<{
      courseOfferings: CourseOffering[];
      courses: Course[];
      classes: ClassItem[];
      teachers: Teacher[];
      departments: Department[];
    }>('directory');

    setOfferings(directoryRes.courseOfferings);
    setCourses(directoryRes.courses.filter((course) => course.status === 'ACTIVE'));
    setClasses(directoryRes.classes.filter((item) => item.status === 'ACTIVE'));
    setTeachers(directoryRes.teachers.filter((teacher) => teacher.status === 'ACTIVE'));
    setError(null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Could not load course offerings.'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      if (editingOfferingId) {
        await apiPost('updateCourseOffering', {
          offeringId: editingOfferingId,
          courseId: form.courseId,
          classId: form.classId,
          teacherId: form.teacherId,
          semester: form.semester
        });
        setNotice('Course offering updated.');
      } else {
        await apiPost('createCourseOffering', {
          courseId: form.courseId,
          classId: form.classId,
          teacherId: form.teacherId,
          semester: form.semester
        });
        setNotice('Course offering created.');
      }

      setForm(emptyForm());
      setEditingOfferingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save course offering.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(offering: CourseOffering) {
    setError(null);
    try {
      await apiPost('updateCourseOffering', {
        offeringId: offering.offeringId,
        status: offering.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update course offering.');
    }
  }

  function editOffering(offering: CourseOffering) {
    setEditingOfferingId(offering.offeringId);
    setForm({
      courseId: offering.courseId,
      classId: offering.classId,
      teacherId: offering.teacherId,
      semester: offering.semester
    });
    setError(null);
    setNotice(null);
  }

  function cancelEdit() {
    setEditingOfferingId(null);
    setForm(emptyForm());
  }

  const courseName = (courseId: string) =>
    courses.find((course) => course.courseId === courseId)?.courseName ?? courseId;
  const className = (classId: string) =>
    classes.find((item) => item.classId === classId)?.className ?? classId;
  const teacherName = (teacherId: string) =>
    teachers.find((teacher) => teacher.teacherId === teacherId)?.teacherName ?? teacherId;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">Course Offerings</h1>
        <p className="text-sm text-ink/60">Connect a course, class, teacher, and semester.</p>
      </header>

      <form onSubmit={handleSubmit} className="card mb-8 grid gap-3 p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Course</label>
          <select
            className="field"
            required
            value={form.courseId}
            onChange={(e) => setForm({ ...form, courseId: e.target.value })}
          >
            <option value="">Select…</option>
            {courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseName}
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
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Teacher</label>
          <select
            className="field"
            required
            value={form.teacherId}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
          >
            <option value="">Select…</option>
            {teachers.map((teacher) => (
              <option key={teacher.teacherId} value={teacher.teacherId}>
                {teacher.teacherName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Semester</label>
          <input
            className="field"
            required
            value={form.semester}
            onChange={(e) => setForm({ ...form, semester: e.target.value })}
            placeholder="e.g. 2026-1"
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? (editingOfferingId ? 'Saving…' : 'Creating…') : editingOfferingId ? 'Save changes' : 'Create offering'}
          </button>
          {editingOfferingId && (
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

      {!offerings ? (
        <Spinner label="Loading offerings…" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="ledger">
            <thead>
              <tr>
                <th>Course</th>
                <th>Class</th>
                <th>Teacher</th>
                <th>Semester</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {offerings.map((offering) => (
                <tr key={offering.offeringId}>
                  <td>{courseName(offering.courseId)}</td>
                  <td>{className(offering.classId)}</td>
                  <td>{teacherName(offering.teacherId)}</td>
                  <td>{offering.semester}</td>
                  <td>
                    <StatusBadge value={offering.status} />
                  </td>
                  <td className="space-x-2">
                    <button
                      type="button"
                      onClick={() => editOffering(offering)}
                      className="btn btn-outline px-2.5 py-1 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(offering)}
                      className="btn btn-outline px-2.5 py-1 text-xs"
                    >
                      {offering.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
