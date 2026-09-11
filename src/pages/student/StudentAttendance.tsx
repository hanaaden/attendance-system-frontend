import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';

interface ExcuseRequest {
  requestId: string;
  studentId?: string;
  offeringId?: string;
  attendanceId?: string;
  date?: string;
  reason: string;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
  adminComment?: string;
}

interface AttendanceRecord {
  attendanceId: string;
  date: string;
  status: string;
  canSubmitExcuse: boolean;
  excuseRequest: ExcuseRequest | null;
  excuseAction: string;
}

interface Course {
  offeringId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  classId: string;
  className: string;
  teacherId: string;
  present: number;
  absent: number;
  excused: number;
  total: number;
  percentage: number;
  attendance: AttendanceRecord[];
}

interface DashboardData {
  student: {
    studentId: string;
    studentName: string;
    email: string;
    classId: string;
    className: string;
  };
  courses: Course[];
  excuseRequests?: ExcuseRequest[];
}

type ExcuseTarget = {
  offeringId: string;
  date: string;
  courseName: string;
  courseCode: string;
};

export default function StudentAttendance() {
  const { user } = useAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedExcuse, setSelectedExcuse] =
    useState<ExcuseTarget | null>(null);

  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.studentId) return;

    loadAttendance();
  }, [user?.studentId]);

  async function loadAttendance() {
    if (!user?.studentId) return;

    try {
      setError(null);

      const result = await apiGet<DashboardData>(
        'studentDashboard',
        {
          studentId: user.studentId,
        }
      );

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load your attendance.'
      );
    }
  }

  function openExcuseForm(
    course: Course,
    date?: string
  ) {
    setSelectedExcuse({
      offeringId: course.offeringId,
      date: date || getTodayDate(),
      courseName: course.courseName,
      courseCode: course.courseCode,
    });

    setReason('');
    setSuccess(null);
    setError(null);
  }

  function closeExcuseForm() {
    if (submitting) return;

    setSelectedExcuse(null);
    setReason('');
  }

  function getExistingRequest(
    offeringId: string,
    date: string
  ) {
    if (!data?.excuseRequests) {
      return null;
    }

    return (
      data.excuseRequests.find((request) => {
        return (
          request.offeringId === offeringId &&
          normalizeDate(request.date) ===
            normalizeDate(date)
        );
      }) || null
    );
  }

  async function handleSubmitExcuse(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user?.studentId) {
      setError('Student ID is missing.');
      return;
    }

    if (!selectedExcuse) {
      setError('Course information is missing.');
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError(
        'Please provide a reason for your absence.'
      );
      return;
    }

    if (!selectedExcuse.date) {
      setError('Please select a date.');
      return;
    }

    const existingRequest =
      getExistingRequest(
        selectedExcuse.offeringId,
        selectedExcuse.date
      );

    if (existingRequest) {
      const status =
        existingRequest.status.toUpperCase();

      if (
        status === 'PENDING' ||
        status === 'APPROVED'
      ) {
        setError(
          'An excuse request already exists for this course and date.'
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await apiPost(
        'submitExcuseRequest',
        {
          studentId: user.studentId,
          offeringId:
            selectedExcuse.offeringId,
          date: selectedExcuse.date,
          reason: trimmedReason,
        }
      );

      setSuccess(
        'Your excuse request has been submitted successfully.'
      );

      setSelectedExcuse(null);
      setReason('');

      await loadAttendance();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not submit your excuse request.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !data) {
    return <Banner kind="error">{error}</Banner>;
  }

  if (!data) {
    return (
      <Spinner label="Loading your attendance…" />
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-2xl text-ink">
          My Attendance
        </h1>

        <p className="text-sm text-ink/60">
          View your attendance and submit an excuse
          request for an absence.
        </p>
      </header>

      {error && (
        <div className="mb-6">
          <Banner kind="error">{error}</Banner>
        </div>
      )}

      {success && (
        <div className="mb-6">
          <Banner kind="success">{success}</Banner>
        </div>
      )}

      {data.courses.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-sm text-ink/60">
            No courses found.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {data.courses.map((course) => (
            <section
              key={course.offeringId}
              className="card overflow-hidden"
            >
              <div className="border-b border-board/20 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-serif text-lg text-ink">
                      {course.courseName ||
                        course.courseCode}
                    </h2>

                    <p className="text-xs text-ink/50">
                      {course.courseCode} ·{' '}
                      {course.className}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <div className="text-sm text-ink/60">
                      Attendance: {course.percentage}%
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openExcuseForm(course)
                      }
                      className="font-medium text-board hover:underline"
                    >
                      Request Excuse
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="ledger w-full">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Excuse</th>
                    </tr>
                  </thead>

                  <tbody>
                    {course.attendance.map(
                      (record) => (
                        <tr
                          key={record.attendanceId}
                        >
                          <td>{record.date}</td>

                          <td>
                            <AttendanceStatus
                              status={record.status}
                            />
                          </td>

                          <td>
                            {record.status ===
                              'ABSENT' &&
                            record.canSubmitExcuse ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openExcuseForm(
                                    course,
                                    record.date
                                  )
                                }
                                className="font-medium text-board hover:underline"
                              >
                                {record.excuseRequest
                                  ?.status ===
                                'REJECTED'
                                  ? 'Request Again'
                                  : 'Request Excuse'}
                              </button>
                            ) : record.excuseRequest ? (
                              <div>
                                <p className="text-sm font-medium text-ink">
                                  {
                                    record
                                      .excuseRequest
                                      .status
                                  }
                                </p>

                                {record
                                  .excuseRequest
                                  .adminComment && (
                                  <p className="mt-1 text-xs text-ink/60">
                                    {
                                      record
                                        .excuseRequest
                                        .adminComment
                                    }
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-ink/40">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    )}

                    {course.attendance.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-8 text-center text-sm text-ink/50"
                        >
                          No attendance records yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {selectedExcuse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="font-serif text-xl text-ink">
                Request an Excuse
              </h2>

              <p className="mt-1 text-sm text-ink/60">
                {selectedExcuse.courseName ||
                  selectedExcuse.courseCode}
              </p>
            </div>

            <form onSubmit={handleSubmitExcuse}>
              <div className="mb-5">
                <label
                  htmlFor="excuse-date"
                  className="mb-2 block text-sm font-medium text-ink"
                >
                  Date
                </label>

                <input
                  id="excuse-date"
                  type="date"
                  value={selectedExcuse.date}
                  onChange={(event) =>
                    setSelectedExcuse({
                      ...selectedExcuse,
                      date: event.target.value,
                    })
                  }
                  disabled={submitting}
                  className="w-full rounded-md border border-board/30 bg-white p-3 text-sm text-ink outline-none transition focus:border-board"
                />
              </div>

              <div>
                <label
                  htmlFor="excuse-reason"
                  className="mb-2 block text-sm font-medium text-ink"
                >
                  Reason for absence
                </label>

                <textarea
                  id="excuse-reason"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="Please explain why you will be absent..."
                  rows={5}
                  disabled={submitting}
                  className="w-full rounded-md border border-board/30 bg-white p-3 text-sm text-ink outline-none transition focus:border-board"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeExcuseForm}
                  disabled={submitting}
                  className="rounded-md border border-board/30 px-4 py-2 text-sm text-ink hover:bg-board/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !reason.trim() ||
                    !selectedExcuse.date
                  }
                  className="rounded-md bg-board px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? 'Submitting…'
                    : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeDate(
  value: string | undefined
) {
  if (!value) return '';

  return value
    .trim()
    .slice(0, 10);
}

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, '0');
  const day = String(
    today.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function AttendanceStatus({
  status,
}: {
  status: string;
}) {
  const normalized = status.toUpperCase();

  if (normalized === 'PRESENT') {
    return (
      <span className="font-medium text-pen-green">
        Present
      </span>
    );
  }

  if (normalized === 'ABSENT') {
    return (
      <span className="font-medium text-pen-red">
        Absent
      </span>
    );
  }

  if (normalized === 'EXCUSED') {
    return (
      <span className="font-medium text-board">
        Excused
      </span>
    );
  }

  return (
    <span className="text-ink/60">
      {status}
    </span>
  );
}