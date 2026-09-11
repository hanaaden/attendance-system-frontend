import {
  useAuth,
} from './context/AuthContext';

import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';


export default function App() {

  const {
    user,
  } = useAuth();


  if (!user) {
    return <Login />;
  }


  switch (user.role) {

    case 'ADMIN':
      return <AdminDashboard />;

    case 'TEACHER':
      return <TeacherDashboard />;

    case 'STUDENT':
      return <StudentDashboard />;

    default:
      return (
        <main className="page">

          <div className="error-card">

            <h2>
              Unknown user role
            </h2>

            <p>
              Your account has an unsupported role.
            </p>

          </div>

        </main>
      );
  }
}