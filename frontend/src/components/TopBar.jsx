import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close the dropdown when the user clicks anywhere outside it.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowMenu(false);
    logout();
    navigate('/login');
  };

  const initials = (user?.name || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-40">
      <div className="flex justify-between items-center h-16 w-full px-lg mx-auto max-w-container-max">
        {/* Brand shows on mobile only, where the sidebar is hidden. */}
        <h1 className="font-headline-md text-headline-md font-bold text-primary md:hidden">AssignTrack</h1>

        <div className="flex items-center gap-sm ml-auto" ref={menuRef}>
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex items-center gap-sm rounded-full pr-sm hover:bg-surface-container-low transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center">
                {initials}
              </span>
              <span className="font-label-md text-label-md text-on-surface hidden sm:inline">{user?.name}</span>
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">arrow_drop_down</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-sm px-md py-sm font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-sm px-md py-sm font-label-md text-label-md text-error hover:bg-error-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
