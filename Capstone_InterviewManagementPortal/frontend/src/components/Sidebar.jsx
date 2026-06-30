import { 
  LayoutDashboard, 
  Briefcase, 
  UserCheck, 
  Calendar, 
  Users, 
  LogOut
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  userRole, 
  onLogout,
  isOpen,
  setIsOpen
}) {
  const isAdmin = userRole === 'Admin' || userRole === 'Administrator';

  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: UserCheck },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
  ];

  const menuItems = isAdmin
    ? [...mainMenuItems, { id: 'users', label: 'Users', icon: Users }]
    : mainMenuItems;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
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
