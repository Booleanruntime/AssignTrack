import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/AssignTrackLogo.png';
import {
  Typography
} from '@mui/material';


const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

const isAuthPage =
  location.pathname === '/login' || location.pathname === '/register';

  // Login and register own the whole viewport, so the top
  // nav would just get in the way here.
  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-6">
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
        {user && !isAuthPage ? (
          <>
 

  <div
  className="flex items-center gap-1"
  onClick={() => setShowUserMenu(!showUserMenu)}
  style={{
    position: 'relative',
    cursor: 'pointer'
  }}
>
  <Typography
    sx={{
      fontSize: '18px',
      fontWeight: 600,
      color: '#111827',
      letterSpacing: '-0.02em',
      cursor: 'pointer'
    }}
  >
    {user?.name}
  </Typography>

  <span
  style={{
    color: '#111827',
    fontSize: '22px',
    fontWeight: 700,
    lineHeight: 1,
    cursor: 'pointer'
  }}
>
    ▾
  </span>

  {showUserMenu && (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: '34px',
        backgroundColor: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
        minWidth: '140px',
        zIndex: 1000
      }}
    >
      <button
        onClick={() => {
          setShowUserMenu(false);
          navigate('/profile');
        }}
        style={{
          display: 'block',
          width: '100%',
          padding: '10px 14px',
          background: 'none',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer'
        }}
      >
        Profile
      </button>

      <button
        onClick={() => {
          setShowUserMenu(false);
          handleLogout();
        }}
        style={{
          display: 'block',
          width: '100%',
          padding: '10px 14px',
          background: 'none',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  )}
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
