const API_URL = import.meta.env.VITE_APPSCRIPT_URL;

if (!API_URL) {
  throw new Error('VITE_APPSCRIPT_URL is missing');
}

export interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  [key: string]: unknown;
}

export interface LoginResponse extends ApiResponse {
  user?: {
    userId: string;
    email: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    teacherId?: string;
    studentId?: string;
    status?: string;
  };
}

export interface Department {
  DepartmentID: string;
  DepartmentName: string;
  Status: string;
}

export interface Teacher {
  TeacherID: string;
  TeacherName: string;
  Email: string;
  DepartmentID: string;
  Status: string;
}

export interface Student {
  StudentID: string;
  StudentName: string;
  Email: string;
  DepartmentID: string;
  Status: string;
}

export interface Class {
  ClassID: string;
  ClassName: string;
  DepartmentID: string;
  TeacherID: string;
  Semester: string;
  Status: string;
}

export interface Enrollment {
  EnrollmentID: string;
  ClassID: string;
  StudentID: string;
  Status: string;
}

export interface Attendance {
  AttendanceID: string;
  Timestamp: string;
  Date: string;
  ClassID: string;
  StudentID: string;
  StudentName: string;
  Status: 'PRESENT' | 'ABSENT';
  RecordedBy: string;
}

export interface DirectoryResponse extends ApiResponse {
  departments: Department[];
  classes: Class[];
  teachers: Teacher[];
  students: Student[];
  enrollments: Enrollment[];
}

export interface TeacherDashboardData extends ApiResponse {
  classes: Class[];
}

export interface StudentClassAttendance {
  classId: string;
  className: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

export interface StudentDashboardData extends ApiResponse {
  student: {
    studentId: string;
    studentName: string;
  };
  classes: StudentClassAttendance[];
}

export interface AdminSummary {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalAttendanceRecords: number;
  present: number;
  absent: number;
  attendanceRate: string;
}

export interface AdminDashboardData extends ApiResponse {
  summary: AdminSummary;
  students: Student[];
  teachers: Teacher[];
  classes: Class[];
}

export interface AttendanceResponse extends ApiResponse {
  attendance?: Attendance[];
}

export interface ClassAttendanceResponse extends ApiResponse {
  attendance?: Attendance[];
}

export interface StudentsResponse extends ApiResponse {
  students: Student[];
}

export interface TeachersResponse extends ApiResponse {
  teachers: Teacher[];
}

export interface ClassesResponse extends ApiResponse {
  classes: Class[];
}

/**
 * Generic GET request.
 */
export async function apiGet<T>(
  params: Record<string, string>
): Promise<T> {
  const query = new URLSearchParams(params);

  const response = await fetch(`${API_URL}?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.status === 'error') {
    throw new Error(data.message || 'API request failed');
  }

  return data as T;
}

/**
 * Generic POST request.
 *
 * We intentionally do NOT set Content-Type.
 * This avoids unnecessary CORS preflight problems with Google Apps Script.
 *
 * Apps Script receives the JSON through e.postData.contents.
 */
export async function apiPost<T>(
  action: string,
  data: Record<string, unknown>
): Promise<T> {
  const response = await fetch(
    `${API_URL}?action=${encodeURIComponent(action)}`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.status === 'error') {
    throw new Error(result.message || 'API request failed');
  }

  return result as T;
}

/**
 * Login
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiGet<LoginResponse>({
    action: 'login',
    email,
    password,
  });
}

/**
 * Directory
 */
export async function getDirectory(): Promise<DirectoryResponse> {
  return apiGet<DirectoryResponse>({
    action: 'directory',
  });
}

/**
 * Teacher dashboard
 */
export async function getTeacherDashboard(
  teacherId: string
): Promise<TeacherDashboardData> {
  return apiGet<TeacherDashboardData>({
    action: 'teacherDashboard',
    teacherId,
  });
}

/**
 * Student dashboard
 */
export async function getStudentDashboard(
  studentId: string
): Promise<StudentDashboardData> {
  return apiGet<StudentDashboardData>({
    action: 'studentDashboard',
    studentId,
  });
}

/**
 * Admin dashboard
 */
export async function getAdminDashboard(): Promise<AdminDashboardData> {
  return apiGet<AdminDashboardData>({
    action: 'adminDashboard',
  });
}

/**
 * Get all students.
 */
export async function getStudents(): Promise<StudentsResponse> {
  return apiGet<StudentsResponse>({
    action: 'students',
  });
}

/**
 * Get all teachers.
 */
export async function getTeachers(): Promise<TeachersResponse> {
  return apiGet<TeachersResponse>({
    action: 'teachers',
  });
}

/**
 * Get all classes.
 */
export async function getClasses(): Promise<ClassesResponse> {
  return apiGet<ClassesResponse>({
    action: 'classes',
  });
}

/**
 * Get all attendance records.
 */
export async function getAttendance(): Promise<AttendanceResponse> {
  return apiGet<AttendanceResponse>({
    action: 'attendance',
  });
}

/**
 * Get attendance for one class.
 */
export async function getClassAttendance(
  classId: string
): Promise<ClassAttendanceResponse> {
  return apiGet<ClassAttendanceResponse>({
    action: 'classAttendance',
    classId,
  });
}

/**
 * Create teacher + login account.
 */
export async function createTeacher(data: {
  teacherName: string;
  email: string;
  departmentId: string;
  password: string;
}): Promise<ApiResponse> {
  return apiPost<ApiResponse>('createTeacher', data);
}

/**
 * Create student + login account.
 */
export async function createStudent(data: {
  studentName: string;
  email: string;
  departmentId: string;
  password: string;
}): Promise<ApiResponse> {
  return apiPost<ApiResponse>('createStudent', data);
}

/**
 * Create class.
 */
export async function createClass(data: {
  className: string;
  departmentId: string;
  teacherId: string;
  semester: string;
}): Promise<ApiResponse> {
  return apiPost<ApiResponse>('createClass', data);
}

/**
 * Enroll student.
 */
export async function enrollStudent(data: {
  classId: string;
  studentId: string;
}): Promise<ApiResponse> {
  return apiPost<ApiResponse>('enrollStudent', data);
}

/**
 * Record attendance.
 */
export async function recordAttendance(data: {
  classId: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT';
  recordedBy: string;
}): Promise<ApiResponse> {
  return apiPost<ApiResponse>('attendance', data);
}

/**
 * Update user status.
 */
export async function updateUserStatus(data: {
  userId: string;
  status: 'ACTIVE' | 'INACTIVE';
}): Promise<ApiResponse> {
  return apiPost<ApiResponse>('updateUserStatus', data);
}

/**
 * Update student.
 */
export async function updateStudent(data: {
  studentId: string;
  studentName?: string;
  email?: string;
  departmentId?: string;
  status?: string;
}): Promise<ApiResponse> {
  return apiPost<ApiResponse>('updateStudent', data);
}

/**
 * Update teacher.
 */
export async function updateTeacher(data: {
  teacherId: string;
  teacherName?: string;
  email?: string;
  departmentId?: string;
  status?: string;
}): Promise<ApiResponse> {
  return apiPost<ApiResponse>('updateTeacher', data);
}

/**
 * Update class.
 */
export async function updateClass(data: {
  classId: string;
  className?: string;
  departmentId?: string;
  teacherId?: string;
  semester?: string;
  status?: string;
}): Promise<ApiResponse> {
  return apiPost<ApiResponse>('updateClass', data);
}

/**
 * Update attendance.
 */
export async function updateAttendance(data: {
  attendanceId: string;
  status: 'PRESENT' | 'ABSENT';
}): Promise<ApiResponse> {
  return apiPost<ApiResponse>('updateAttendance', data);
}

/**
 * Remove student from class.
 */
export async function removeEnrollment(data: {
  enrollmentId: string;
}): Promise<ApiResponse> {
  return apiPost<ApiResponse>('removeEnrollment', data);
}