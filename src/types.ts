export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type Role = UserRole;

export type Status = 'ACTIVE' | 'INACTIVE';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';

export type ExcuseRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  userId: string;
  email: string;
  role: UserRole;
  teacherId?: string;
  studentId?: string;
  status: Status;
}

export type AuthUser = User;

export interface Department {
  departmentId: string;
  departmentName: string;
  status: Status;
}

export interface Teacher {
  teacherId: string;
  teacherName: string;
  email: string;
  departmentId: string;
  status: Status;
}

export interface Student {
  studentId: string;
  studentName: string;
  email: string;
  departmentId: string;
  classId: string;
  status: Status;
}

export interface ClassItem {
  classId: string;
  className: string;
  departmentId: string;
  semester: string;
  status: Status;
}

export interface Course {
  courseId: string; 
  courseCode: string;
  courseName: string;
  departmentId: string;
  status: Status;
}

export interface CourseOffering {
  offeringId: string;
  courseId: string;
  classId: string;
  teacherId: string;
  semester: string;
  status: Status;

  courseCode?: string;
  courseName?: string;
  className?: string;
  teacherName?: string;
}

export interface AttendanceRecord {
  attendanceId: string;
  timestamp: string;
  date: string;
  offeringId: string;
  classId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  recordedBy: string;

  courseName?: string;
  courseCode?: string;
  className?: string;
  teacherName?: string;

  canSubmit?: boolean;
}

export interface ExcuseRequest {
  requestId: string;

  studentId: string;
  studentName?: string;

  offeringId?: string;
  attendanceId?: string;

  reason: string;

  date?: string;
  attendanceDate?: string;

  submittedAt: string;

  status: ExcuseRequestStatus;

  reviewedBy?: string;
  reviewedAt?: string;
  adminComment?: string;

  courseId?: string;
  courseName?: string;
  courseCode?: string;

  classId?: string;
  className?: string;

  currentAttendanceStatus?: AttendanceStatus;

  canSubmit?: boolean;
}



export interface AttendanceSummary {
  present: number;
  absent: number;
  excused: number;
  total: number;
  percentage: number;
}

export interface StudentCourseAttendance {
  courseId: string;
  courseCode?: string;
  courseName: string;
  present: number;
  absent: number;
  excused: number;
  total: number;
  percentage: number;
}

export interface StudentDashboardData {
  student: Student;
  summary: AttendanceSummary;
  courses: StudentCourseAttendance[];
  attendance: AttendanceRecord[];
  excuseRequests: ExcuseRequest[];
}

export interface TeacherClassSummary {
  classId: string;
  className: string;
  departmentId: string;
  semester: string;
  status: Status;
  studentCount: number;
  present: number;
  absent: number;
  total: number;
  percentage: number;
  students: Student[];
}

export interface StudentClassSummary {
  classId: string;
  className: string;
  departmentId: string;
  teacherId?: string;
  semester: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

export interface AdminSummary {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalCourses: number;
  totalCourseOfferings: number;
  totalAttendanceRecords: number;
  present: number;
  absent: number;
  excused: number;
  attendanceRate: number;
  pendingExcuses: number;
  approvedExcuses: number;
  rejectedExcuses: number;
}

export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  departmentId?: string;
  classId?: string;
  className?: string;
  present: number;
  absent: number;
  excused: number;
  total: number;
  percentage: number;
}

export interface AdminDashboardData {
  summary: AdminSummary;
  studentAttendance: StudentAttendanceSummary[];
  teachers: Teacher[];
  classes: ClassItem[];
  courses: Course[];
  courseOfferings: CourseOffering[];
  attendance: AttendanceRecord[];
  excuseRequests: ExcuseRequest[];
}

export interface DirectoryData {
  departments: Department[];
  students: Student[];
  teachers: Teacher[];
  classes: ClassItem[];
  courses: Course[];
  courseOfferings: CourseOffering[];
  attendance?: AttendanceRecord[];
  excuseRequests?: ExcuseRequest[];
}

export interface ApiResult<T = Record<string, unknown>> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}
