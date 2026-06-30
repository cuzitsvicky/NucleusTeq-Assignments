import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  UserCheck, 
  Calendar, 
  Users, 
  LogOut
} from 'lucide-react';

export default function Sidebar({ 
  userRole, 
  onLogout,
  isOpen,
  setIsOpen
}) {
  const isAdmin = userRole === 'Admin' || userRole === 'Administrator';

  const mainMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/candidates', label: 'Candidates', icon: UserCheck },
    { path: '/interviews', label: 'Interviews', icon: Calendar },
  ];

  const menuItems = isAdmin
    ? [...mainMenuItems, { path: '/users', label: 'Users', icon: Users }]
    : mainMenuItems;

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <span>TalentPort</span>
          </div>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li 
                key={item.path} 
                className="menu-item"
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
