import React from 'react';
import { LogOut, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { user, logout } = useAuth();

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-logo-icon">
          <CheckSquare size={22} strokeWidth={2.5} />
        </div>
        <span>Task<span className="gradient-text">master</span></span>
      </div>

      {user && (
        <div className="nav-user">
          <div className="nav-user-info">
            <span className="nav-user-name">{user.name}</span>
            <span className="nav-user-role">{user.email}</span>
          </div>
          <div className="nav-avatar" title={user.name}>
            {getInitials(user.name)}
          </div>
          <button 
            onClick={logout} 
            className="btn btn-secondary" 
            style={{ padding: '8px 14px', fontSize: '0.875rem' }}
            title="Log Out"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
