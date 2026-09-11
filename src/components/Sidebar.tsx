import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/teachers', label: 'Teachers' },
  { to: '/admin/departments', label: 'Departments' },
  { to: '/admin/classes', label: 'Classes' },
  { to: '/admin/courses', label: 'Courses' },
  { to: '/admin/course-offerings', label: 'Course Offerings' },
  { to: '/admin/attendance', label: 'Attendance' },
  { to: '/admin/excuse-requests', label: 'Excuse Requests' }
];

const TEACHER_LINKS = [{ to: '/teacher', label: 'My classes', end: true }];

const STUDENT_LINKS = [{ to: '/student', label: 'My attendance', end: true }
  ,{ to: '/student/attendance', label: 'Submit Excuse Request', end: true }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const links =
    user.role === 'ADMIN'
      ? ADMIN_LINKS
      : user.role === 'TEACHER'
      ? TEACHER_LINKS
      : STUDENT_LINKS;

  return (
    <aside className="flex h-full w-60 flex-col justify-between bg-board px-4 py-6 text-chalk">
      <div>
        <div className="mb-8 px-2">
          <p className="font-serif text-xl leading-tight">Register</p>
          <p className="text-xs text-chalk/60">Attendance office</p>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={'end' in link ? link.end : false}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-chalk/15 text-chalk'
                    : 'text-chalk/70 hover:bg-chalk/10 hover:text-chalk'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-chalk/15 px-2 pt-4 text-xs">
        <p className="mb-1 truncate text-chalk/80">{user.email}</p>
        <p className="mb-3 text-chalk/50">{user.role}</p>
        <button
          onClick={logout}
          className="w-full rounded border border-chalk/30 px-3 py-1.5 text-left text-chalk/80 hover:bg-chalk/10"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
