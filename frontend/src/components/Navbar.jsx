import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/AssignTrackLogo.png';


const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  return (
    // px-6 py-2
    <nav className="bg-white shadow-sm px-6 py-2 flex justify-between items-center">
        <div className="flex items-center gap-10">
  <Link to="/tasks" className="flex items-center">
    <img
      src={logo}
      alt="AssignTrack"
      style={{
        height: '55px',
        width: 'auto'
      }}
    />
  </Link>

  {user && (
    <div className="flex items-center gap-6">
      <Link
        to="/tasks"
        style={{
          fontSize: '14px',
          fontWeight: location.pathname === '/tasks' ? 600 : 400,
          color: location.pathname === '/tasks' ? '#2e67e4' : '#1E293B',
          textDecoration: location.pathname === '/tasks' ? 'underline' : 'none',
          textUnderlineOffset: '4px'
        }}
      >
        Assignments
      </Link>

      {user?.role === 'admin' && (
        <Link
          to="/subjects"
          style={{
            fontWeight: location.pathname === '/subjects' ? 700 : 400,
            color: location.pathname === '/subjects' ? '#2e67e4' : '#1E293B'
          }}
        >
          Subjects
        </Link>
      )}
    </div>
  )}
</div>
      <div>
        {user ? (
          <>
 

  <div className="flex items-center gap-3">
  <Link
    to="/profile"
    style={{
      fontSize: '16px',
      fontWeight: location.pathname === '/profile' ? 700 : 400,
      color: location.pathname === '/profile' ? '#2e67e4' : '#1E293B',
      textDecoration: location.pathname === '/profile' ? 'underline' : 'none',
      textUnderlineOffset: '4px'
    }}
  >
    Profile
  </Link>

  <span style={{ color: '#CBD5E1' }}>|</span>

  <button
    onClick={handleLogout}
    style={{
      background: 'none',
      border: 'none',
      color: '#1E293B',
      cursor: 'pointer',
      fontSize: '16px',
      fontFamily: 'inherit',
      padding: 0
    }}
  >
    Logout
  </button>
</div>
</>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
