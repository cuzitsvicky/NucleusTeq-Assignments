import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  UserCheck, 
  Calendar, 
  Users, 
  LogOut
} from 'lucide-react';

/**
 * Sidebar Navigation Component.
 * 
 * Props:
 * - activeTab (string): current page state ('dashboard', 'jobs', etc.)
 * - setActiveTab (function): updates tab state
 * - userRole (string): 'Admin' | 'HR' | 'Interviewer'
 * - onLogout (function): logs out the user
 * - isOpen (boolean): mobile open state
 * - setIsOpen (function): toggles mobile open state
 */
export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  userRole, 
  onLogout,
  isOpen,
  setIsOpen
}) {
  const isAdmin = userRole === 'Admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: UserCheck },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
  ];

  // Only show User Management view for Admin role
  if (isAdmin) {
    menuItems.push({ id: 'users', label: 'Users', icon: Users });
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false); // Close sidebar on mobile after clicking
  };

  return (
    <>
      {/* Mobile Drawer Overlay Background */}
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
                key={item.id} 
                className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <button onClick={() => handleTabChange(item.id)}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
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
