const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.warn(
    'VITE_API_URL is not set. Add your Google Apps Script /exec URL to .env.'
  );
}

export interface ApiResult {
  status: 'success' | 'error';
  message?: string;
  [key: string]: unknown;
}

type Params = Record<string, string | number | undefined | null>;

function toQueryString(params: Params): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  return search.toString();
}

/* -----------------------------
   NORMALIZERS
----------------------------- */

function normalizeStudent(student: any) {
  return {
    studentId: String(
      student.StudentID ?? student.studentId ?? ''
    ),
    studentName: String(
      student.StudentName ?? student.studentName ?? ''
    ),
    email: String(
      student.Email ?? student.email ?? ''
    ),
    departmentId: String(
      student.DepartmentID ?? student.departmentId ?? ''
    ),
    classId: String(
      student.ClassID ?? student.classId ?? ''
    ),
    status: String(
      student.Status ?? student.status ?? 'ACTIVE'
    ).toUpperCase()
  };
}

function normalizeTeacher(teacher: any) {
  return {
    teacherId: String(
      teacher.TeacherID ?? teacher.teacherId ?? ''
    ),
    teacherName: String(
      teacher.TeacherName ?? teacher.teacherName ?? ''
    ),
    email: String(
      teacher.Email ?? teacher.email ?? ''
    ),
    departmentId: String(
      teacher.DepartmentID ?? teacher.departmentId ?? ''
    ),
    status: String(
      teacher.Status ?? teacher.status ?? 'ACTIVE'
    ).toUpperCase()
  };
}

function normalizeDepartment(department: any) {
  return {
    departmentId: String(
      department.DepartmentID ?? department.departmentId ?? ''
    ),
    departmentName: String(
      department.DepartmentName ?? department.departmentName ?? ''
    ),
    status: String(
      department.Status ?? department.status ?? 'ACTIVE'
    ).toUpperCase()
  };
}

function normalizeClass(item: any) {
  return {
    classId: String(
      item.ClassID ?? item.classId ?? ''
    ),
    className: String(
      item.ClassName ?? item.className ?? ''
    ),
    departmentId: String(
      item.DepartmentID ?? item.departmentId ?? ''
    ),
    semester: String(
      item.Semester ?? item.semester ?? ''
    ),
    status: String(
      item.Status ?? item.status ?? 'ACTIVE'
    ).toUpperCase()
  };
}

function normalizeCourse(course: any) {
  return {
    courseId: String(
      course.CourseID ?? course.courseId ?? ''
    ),
    courseCode: String(
      course.CourseCode ?? course.courseCode ?? ''
    ),
    courseName: String(
      course.CourseName ?? course.courseName ?? ''
    ),
    departmentId: String(
      course.DepartmentID ?? course.departmentId ?? ''
    ),
    status: String(
      course.Status ?? course.status ?? 'ACTIVE'
    ).toUpperCase()
  };
}

function normalizeOffering(offering: any) {
  return {
    offeringId: String(
      offering.OfferingID ?? offering.offeringId ?? ''
    ),

    courseId: String(
      offering.CourseID ?? offering.courseId ?? ''
    ),

    classId: String(
      offering.ClassID ?? offering.classId ?? ''
    ),

    teacherId: String(
      offering.TeacherID ?? offering.teacherId ?? ''
    ),

    semester: String(
      offering.Semester ?? offering.semester ?? ''
    ),

    status: String(
      offering.Status ?? offering.status ?? 'ACTIVE'
    ).toUpperCase(),

    courseCode:
      offering.CourseCode ??
      offering.courseCode,

    courseName:
      offering.CourseName ??
      offering.courseName,

    className:
      offering.ClassName ??
      offering.className,

    teacherName:
      offering.TeacherName ??
      offering.teacherName
  };
}

function normalizeAttendance(record: any) {
  return {
    attendanceId: String(
      record.AttendanceID ?? record.attendanceId ?? ''
    ),

    timestamp: String(
      record.Timestamp ?? record.timestamp ?? ''
    ),

    date: String(
      record.Date ?? record.date ?? ''
    ),

    offeringId: String(
      record.OfferingID ?? record.offeringId ?? ''
    ),

    classId: String(
      record.ClassID ?? record.classId ?? ''
    ),

    courseId: String(
      record.CourseID ?? record.courseId ?? ''
    ),

    studentId: String(
      record.StudentID ?? record.studentId ?? ''
    ),

    studentName: String(
      record.StudentName ?? record.studentName ?? ''
    ),

    status: String(
      record.Status ?? record.status ?? ''
    ).toUpperCase(),

    recordedBy: String(
      record.RecordedBy ?? record.recordedBy ?? ''
    ),

    courseName:
      record.CourseName ??
      record.courseName,

    courseCode:
      record.CourseCode ??
      record.courseCode,

    className:
      record.ClassName ??
      record.className,

    teacherName:
      record.TeacherName ??
      record.teacherName,

    canSubmit:
      record.CanSubmit ??
      record.canSubmit
  };
}

function normalizeExcuseRequest(request: any) {
  return {
    requestId: String(
      request.RequestID ?? request.requestId ?? ''
    ),

    studentId: String(
      request.StudentID ?? request.studentId ?? ''
    ),

    studentName:
      request.StudentName ??
      request.studentName,

    offeringId: String(
      request.OfferingID ?? request.offeringId ?? ''
    ),

    attendanceId: String(
      request.AttendanceID ?? request.attendanceId ?? ''
    ),

    courseId: String(
      request.CourseID ?? request.courseId ?? ''
    ),

    courseCode:
      request.CourseCode ??
      request.courseCode,

    courseName:
      request.CourseName ??
      request.courseName,

    classId: String(
      request.ClassID ?? request.classId ?? ''
    ),

    className:
      request.ClassName ??
      request.className,

    date:
      request.Date ??
      request.date ??
      '',

    attendanceDate:
      request.AttendanceDate ??
      request.attendanceDate ??
      '',

    reason: String(
      request.Reason ?? request.reason ?? ''
    ),

    submittedAt: String(
      request.SubmittedAt ?? request.submittedAt ?? ''
    ),

    status: String(
      request.Status ?? request.status ?? 'PENDING'
    ).toUpperCase(),

    reviewedBy:
      request.ReviewedBy ??
      request.reviewedBy,

    reviewedAt:
      request.ReviewedAt ??
      request.reviewedAt,

    adminComment:
      request.AdminComment ??
      request.adminComment,

    currentAttendanceStatus:
      request.CurrentAttendanceStatus ??
      request.currentAttendanceStatus,

    canSubmit:
      request.CanSubmit ??
      request.canSubmit
  };
}
/* -----------------------------
   RESPONSE NORMALIZATION
----------------------------- */

function normalizeResponse(
  action: string,
  result: any
) {
  if (!result || typeof result !== 'object') {
    return result;
  }

  const normalized = { ...result };

  /* -----------------------------
     DIRECTORY
  ----------------------------- */

  if (action === 'directory') {
    normalized.students = Array.isArray(
      result.students
    )
      ? result.students.map(normalizeStudent)
      : [];

    normalized.teachers = Array.isArray(
      result.teachers
    )
      ? result.teachers.map(normalizeTeacher)
      : [];

    normalized.departments = Array.isArray(
      result.departments
    )
      ? result.departments.map(normalizeDepartment)
      : [];

    normalized.classes = Array.isArray(
      result.classes
    )
      ? result.classes.map(normalizeClass)
      : [];

    normalized.courses = Array.isArray(
      result.courses
    )
      ? result.courses.map(normalizeCourse)
      : [];

    const offerings =
      Array.isArray(result.courseOfferings)
        ? result.courseOfferings
        : Array.isArray(result.offerings)
          ? result.offerings
          : [];

    normalized.courseOfferings =
      offerings.map(normalizeOffering);

    normalized.attendance =
      Array.isArray(result.attendance)
        ? result.attendance.map(normalizeAttendance)
        : [];

    normalized.excuseRequests =
      Array.isArray(result.excuseRequests)
        ? result.excuseRequests.map(
            normalizeExcuseRequest
          )
        : [];
  }

  /* -----------------------------
     STUDENTS
  ----------------------------- */

if (action === 'studentDashboard') {
  normalized.student = result.student
    ? normalizeStudent(result.student)
    : null;

  normalized.summary = result.summary ?? {
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0
  };

  normalized.classes = Array.isArray(result.classes)
    ? result.classes
    : [];
}

  /* -----------------------------
     TEACHERS
  ----------------------------- */

  if (action === 'teachers') {
    normalized.teachers =
      Array.isArray(result.teachers)
        ? result.teachers.map(normalizeTeacher)
        : [];
  }

  /* -----------------------------
     DEPARTMENTS
  ----------------------------- */

  if (action === 'departments') {
    normalized.departments =
      Array.isArray(result.departments)
        ? result.departments.map(
            normalizeDepartment
          )
        : [];
  }

  /* -----------------------------
     CLASSES
  ----------------------------- */

  if (action === 'classes') {
    normalized.classes =
      Array.isArray(result.classes)
        ? result.classes.map(normalizeClass)
        : [];
  }

  /* -----------------------------
     COURSES
  ----------------------------- */

  if (action === 'courses') {
    normalized.courses =
      Array.isArray(result.courses)
        ? result.courses.map(normalizeCourse)
        : [];
  }

  /* -----------------------------
     COURSE OFFERINGS
  ----------------------------- */

  if (action === 'courseOfferings') {
    const offerings =
      Array.isArray(result.courseOfferings)
        ? result.courseOfferings
        : Array.isArray(result.offerings)
          ? result.offerings
          : [];

    normalized.courseOfferings =
      offerings.map(normalizeOffering);
  }

  /* -----------------------------
     ATTENDANCE
  ----------------------------- */

  if (action === 'attendance') {
    normalized.attendance =
      Array.isArray(result.attendance)
        ? result.attendance.map(
            normalizeAttendance
          )
        : [];
  }

  /* -----------------------------
     EXCUSE REQUESTS
  ----------------------------- */

  if (action === 'excuseRequests') {
    normalized.excuseRequests =
      Array.isArray(result.excuseRequests)
        ? result.excuseRequests.map(
            normalizeExcuseRequest
          )
        : [];
  }

  /* -----------------------------
     TEACHER DASHBOARD
  ----------------------------- */

  if (action === 'teacherDashboard') {
    normalized.teacher = result.teacher
      ? normalizeTeacher(result.teacher)
      : null;

    normalized.offerings =
      Array.isArray(result.offerings)
        ? result.offerings.map(
            normalizeOffering
          )
        : [];
  }

  return normalized;
}

/* -----------------------------
   REQUEST
----------------------------- */

async function request<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch {
    throw new Error(
      'Could not reach the attendance server. Check VITE_API_URL and your connection.'
    );
  }

  let data: ApiResult;

  try {
    data =
      (await response.json()) as ApiResult;
  } catch {
    throw new Error(
      `The server returned an invalid response. HTTP ${response.status}.`
    );
  }

  if (data.status === 'error') {
    throw new Error(
      data.message ||
        'The server rejected the request.'
    );
  }

  return data as T;
}

/* -----------------------------
   GET
----------------------------- */

export async function apiGet<T>(
  action: string,
  params: Params = {}
): Promise<T> {
  const qs = toQueryString({
    action,
    ...params
  });

  const result = await request<any>(
    `${BASE_URL}?${qs}`
  );

  return normalizeResponse(
    action,
    result
  ) as T;
}

/* -----------------------------
   POST
----------------------------- */

export function apiPost<T>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  return request<T>(
    `${BASE_URL}?action=${encodeURIComponent(action)}`,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}