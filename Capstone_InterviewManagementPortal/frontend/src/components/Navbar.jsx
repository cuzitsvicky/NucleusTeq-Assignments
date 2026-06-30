import { Menu } from 'lucide-react';

const pageTitles = {
  dashboard: 'Dashboard',
  jobs: 'Job Openings',
  candidates: 'Candidate Pipeline',
  interviews: 'Interviews & Feedback',
  users: 'System User Management',
};

export default function Navbar({ title, user, onMenuToggle }) {
  const displayTitle = pageTitles[title] || 'Portal';

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
        <h1 className="nav-title">{displayTitle}</h1>
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
