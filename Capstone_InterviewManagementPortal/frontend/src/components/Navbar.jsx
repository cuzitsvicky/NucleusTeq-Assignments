import React from 'react';
import { Menu } from 'lucide-react';

/**
 * Top Navbar Component.
 * 
 * Props:
 * - title (string): Title of the active section
 * - user (object): logged in user object { name, role, email }
 * - onMenuToggle (function): opens/closes the mobile sidebar
 */
export default function Navbar({ title, user, onMenuToggle }) {
  // Format page titles nicely
  const getDisplayTitle = () => {
    switch (title) {
      case 'dashboard': return 'Dashboard';
      case 'jobs': return 'Job Openings';
      case 'candidates': return 'Candidate Pipeline';
      case 'interviews': return 'Interviews & Feedback';
      case 'users': return 'System User Management';
      default: return 'Portal';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="hamburger-btn" onClick={onMenuToggle}>
          <Menu size={24} />
        </button>
        <h1 className="nav-title">{getDisplayTitle()}</h1>
      </div>

      <div className="nav-right">
        {user && (
          <div className="user-profile-badge">
            <div className="avatar">
              {getInitials(user.name)}
            </div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
