export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type Status = 'ACTIVE' | 'INACTIVE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT';

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
  teacherId: string;
  studentId: string;
  status: Status;
}

export interface Department {
  DepartmentID: string;
  DepartmentName: string;
  Status: Status;
}

export interface Teacher {
  TeacherID: string;
  TeacherName: string;
  Email: string;
  DepartmentID: string;
  Status: Status;
}

export interface Student {
  StudentID: string;
  StudentName: string;
  Email: string;
  DepartmentID: string;
  Status: Status;
}

export interface ClassItem {
  ClassID: string;
  ClassName: string;
  DepartmentID: string;
  TeacherID: string;
  Semester: string;
  Status: Status;
}

export interface Enrollment {
  EnrollmentID: string;
  ClassID: string;
  StudentID: string;
  Status: Status;
}

export interface AttendanceRecord {
  AttendanceID: string;
  Timestamp: string;
  Date: string;
  ClassID: string;
  StudentID: string;
  StudentName: string;
  Status: AttendanceStatus;
  RecordedBy: string;
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

export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  email: string;
  departmentId: string;
  status: Status;
  total: number;
  present: number;
  absent: number;
  percentage: number;
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
  teacherId: string;
  semester: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
}
