export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type Status = 'ACTIVE' | 'INACTIVE';

export type AttendanceStatus = 'PRESENT' | 'ABSENT';

export interface User {
  userId: string;
  email: string;
  role: Role;
  teacherId?: string;
  studentId?: string;
  status?: string;
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

export interface ClassItem {
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
  Status: AttendanceStatus;
  RecordedBy: string;
}

export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  email: string;
  departmentId: string;
  status: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
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

export interface AdminDashboardData {
  status: string;
  summary: AdminSummary;
  students: Student[];
  studentAttendance: StudentAttendanceSummary[];
  teachers: Teacher[];
  classes: ClassItem[];
}

export interface TeacherClass {
  classId: string;
  className: string;
  departmentId: string;
  semester: string;
  status: string;
  studentCount: number;
  present: number;
  absent: number;
  total: number;
  percentage: number;
  students: Student[];
}

export interface TeacherDashboardData {
  status: string;
  teacher: {
    teacherId: string;
    teacherName: string;
    email: string;
    departmentId: string;
    status: string;
  };
  classes: TeacherClass[];
}

export interface StudentClass {
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

export interface StudentDashboardData {
  status: string;
  student: {
    studentId: string;
    studentName: string;
    email: string;
    departmentId: string;
    status: string;
  };
  summary: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
  };
  classes: StudentClass[];
}