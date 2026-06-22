import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Nav is per-role: each role only sees the routes that mean something to it.
// Students do assigned work, teachers author + grade it, admins set up the world.
const NAV_BY_ROLE = {
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/tasks', label: 'Assignments', icon: 'assignment' },
    { to: '/grades', label: 'My Grades', icon: 'grade' },
    { to: '/notifications', label: 'Notifications', icon: 'notifications' },
    { to: '/activity-log', label: 'Activity Log', icon: 'history' },
    { to: '/profile', label: 'Profile', icon: 'account_circle' },
  ],
  teacher: [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/teacher/assignments', label: 'Assignments', icon: 'assignment' },
    { to: '/teacher/grading', label: 'Grading', icon: 'grading' },
    { to: '/notifications', label: 'Notifications', icon: 'notifications' },
    { to: '/activity-log', label: 'Activity Log', icon: 'history' },
    { to: '/profile', label: 'Profile', icon: 'account_circle' },
  ],
  admin: [
    { to: '/subjects', label: 'Subjects', icon: 'menu_book' },
    { to: '/activity-log', label: 'Activity Log', icon: 'history' },
    { to: '/profile', label: 'Profile', icon: 'account_circle' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.student;
  const isActive = (to) => location.pathname === to;

  const linkClass = (to) =>
    `flex items-center gap-md py-sm px-md rounded-lg font-label-md text-label-md transition-colors ${
      isActive(to)
        ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
        : 'text-on-surface-variant font-medium hover:bg-surface-container-highest'
    }`;

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex-col py-lg px-md z-50 hidden md:flex">
      <div className="mb-lg px-md">
        <h1 className="font-headline-md text-headline-md font-bold text-primary">AssignTrack</h1>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">Academic Workspace</p>
      </div>

      {/* Only teachers author assignments, so the primary "create" action is theirs. */}
      {user?.role === 'teacher' && (
        <div className="mb-lg px-md">
          <button
            onClick={() => navigate('/teacher/assignments', { state: { openForm: true } })}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-lg flex items-center justify-center gap-sm hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Assignment
          </button>
        </div>
      )}

      <nav className="flex-1 flex flex-col gap-xs">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className={linkClass(item.to)}>
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-xs pt-md border-t border-outline-variant">
        <button
          onClick={handleLogout}
          className="flex items-center gap-md py-sm px-md rounded-lg text-error font-medium font-label-md text-label-md hover:bg-error-container transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
