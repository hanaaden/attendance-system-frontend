import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute, { homeFor } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminClasses from './pages/admin/AdminClasses';
import AdminCourses from './pages/admin/AdminCourses';
import AdminCourseOfferings from './pages/admin/AdminCourseOfferings';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminExcuseRequests from './pages/admin/AdminExcuseRequests';
import AdminDepartments from './pages/admin/AdminDepartments';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TakeAttendance from './pages/teacher/TakeAttendance';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homeFor(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />

      <Route
        element={
          <ProtectedRoute allow={['ADMIN', 'TEACHER', 'STUDENT']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminDepartments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/course-offerings"
          element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminCourseOfferings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/excuse-requests"
          element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminExcuseRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allow={['TEACHER']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/offerings/:offeringId"
          element={
            <ProtectedRoute allow={['TEACHER']}>
              <TakeAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute allow={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allow={['STUDENT']}>
              <StudentAttendance />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
