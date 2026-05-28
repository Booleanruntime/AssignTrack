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


const navLinkStyle = (path) => ({
  fontSize: '16px',
  fontWeight: location.pathname === path ? 700 : 400,
  color: location.pathname === path ? '#2e67e4' : '#1E293B',
  textDecoration: location.pathname === path ? 'underline' : 'none',
  textUnderlineOffset: '4px'
});
  return (
    // px-6 py-2
    <nav className="bg-white shadow-sm px-6 py-2 flex justify-between items-center">
        <div className="flex items-center gap-10">
  <Link to={user ? "/tasks" : "/login"} className="flex items-center">
    <img
      src={logo}
      alt="AssignTrack"
      style={{
        height: '55px',
        width: 'auto'
      }}
    />
  </Link>

  {user &&  
    location.pathname !== '/login' &&
    location.pathname !== '/register' &&
    (<div className="flex items-center gap-6">
      <Link
        to="/tasks"
        style={navLinkStyle('/tasks')}
      >
        Assignments
      </Link>

      {user?.role === 'admin' && (
        <Link
          to="/subjects"
          style={navLinkStyle('/subjects')}
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
    style={navLinkStyle('/profile')}
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
  {location.pathname !== '/login' && (
    <Link to="/login" className="mr-4">
      Login
    </Link>
  )}

  {location.pathname !== '/register' && (
    <Link to="/register">
      Register
    </Link>
  )}
</>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
