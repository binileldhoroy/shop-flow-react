import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@hooks/useRedux';
import { useAuth } from '@hooks/useAuth';
import { useCompany } from '@hooks/useCompany';
import { logout } from '@store/slices/authSlice';
import { toggleSidebar } from '@store/slices/uiSlice';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button
            className="menu-toggle"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle menu"
          >
            <i className="bi bi-list"></i>
          </button>

          {currentCompany && (
            <div className="company-info">
              {currentCompany.logo && (
                <img
                  src={currentCompany.logo}
                  alt={currentCompany.company_name}
                  className="company-logo"
                />
              )}
              <h1 className="company-name">{currentCompany.company_name}</h1>
            </div>
          )}
        </div>

        <div className="header-right">
          <div className="user-menu" ref={dropdownRef}>
            <button
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">{getUserInitials()}</div>
              <div className="user-info">
                <p className="user-name">
                  {user?.first_name || user?.username}
                </p>
                <p className="user-role">
                  {user?.role.replace('_', ' ')}
                </p>
              </div>
              <i className={`bi bi-chevron-${showUserMenu ? 'up' : 'down'}`}></i>
            </button>

            {showUserMenu && (
              <div className="dropdown-menu show">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                >
                  <i className="bi bi-person"></i>
                  Profile
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                >
                  <i className="bi bi-gear"></i>
                  Settings
                </button>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right"></i>
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

export default Header;
