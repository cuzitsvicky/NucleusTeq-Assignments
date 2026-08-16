import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import Jobs from './pages/Jobs.jsx';
import Candidates from './pages/Candidates.jsx';
import Interviews from './pages/Interviews.jsx';
import Users from './pages/Users.jsx';
import { BriefcaseBusiness, CalendarCheck, Gauge, UsersRound, UserRoundCog, Menu } from 'lucide-react';
import { apiService } from './apiService.js';

/**
 * Route guard component that restricts access to specific routes based on the user's role.
 * If the user does not have a permitted role, an "Access Denied" message is displayed.
 */
function ProtectedRoute({ user, roles, children }) {
  if (!roles.includes(user?.role)) {
    return (
      <section className="box">
        <h1>Access Denied</h1>
        <p>You are not allowed to open this page.</p>
        <Link to="/">Go to Dashboard</Link>
      </section>
    );
  }

  return children;
}

/**
 * Root component of the application.
 * Manages global authentication state, routing, and the main layout shell (including sidebar navigation).
 */
export default function App({ keycloak }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await apiService.getMe(keycloak.token);
        setUser(userData);
      } catch (err) {
        console.error("Failed to load user info from backend:", err);
      } finally {
        setLoading(false);
      }
    }
    if (keycloak?.token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [keycloak?.token]);

  /**
   * Logs the current user out of Keycloak.
   */
  function logout() {
    keycloak.logout({ redirectUri: window.location.origin });
  }

  // Loading state while verifying token and fetching user details from database
  if (loading) {
    return (
      <div className="center" style={{ fontFamily: 'system-ui, sans-serif', color: '#94a3b8', background: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Verifying credentials...</h2>
          <p style={{ marginTop: '8px' }}>Checking session with Talent Flow services.</p>
        </div>
      </div>
    );
  }

  // If Keycloak session is valid but email is not found in local MongoDB
  if (!user) {
    return (
      <main className="center" style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="box" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '40px', maxWidth: '440px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ color: '#f43f5e', fontSize: '24px', marginBottom: '12px' }}>Access Denied</h2>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>
            Your account (<strong>{keycloak.tokenParsed?.email || keycloak.tokenParsed?.preferred_username}</strong>) is not registered in the system. Please request an administrator to register your email.
          </p>
          <button className="button" onClick={logout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Sign Out</button>
        </div>
      </main>
    );
  }

  return (
    <div className="layout">
      <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle Navigation Menu"><Menu size={20} /></button>
      {/* Navigation Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        <h2>Talent Flow</h2>
        <nav>
          {/* Dashboard link is accessible to all logged-in roles */}
          <Link to="/"><Gauge size={17} />Dashboard</Link>
          
          {/* Jobs page is accessible to Admin, HR, and Interviewer */}
          {['Admin', 'HR', 'Interviewer'].includes(user?.role) && (
            <Link to="/jobs"><BriefcaseBusiness size={17} />Jobs</Link>
          )}
          
          {/* Candidates page is accessible to Admin and HR */}
          {['Admin', 'HR'].includes(user?.role) && (
            <Link to="/candidates"><UsersRound size={17} />Candidates</Link>
          )}
          
          {/* Interviews scheduling and feedback page is accessible to all roles */}
          <Link to="/interviews"><CalendarCheck size={17} />Interviews</Link>
          
          {/* User management (adding/modifying system users) is Admin only */}
          {user?.role === 'Admin' && (
            <Link to="/users"><UserRoundCog size={17} />Users</Link>
          )}
        </nav>
        
        {/* User Account Info and Logout */}
        <div className="account">
          <p>Logged in as {user?.role}</p>
          <span></span>
          <button onClick={logout}>Logout</button>
        </div>
      </aside>

      {/* Main Content Area containing routed pages */}
      <main className="content">
        <Routes>
          {/* Dashboard route */}
          <Route path="/" element={<Dashboard token={keycloak.token} />} />
          
          {/* Jobs route - protected for Admin, HR, and Interviewers */}
          <Route path="/jobs" element={
            <ProtectedRoute user={user} roles={['Admin', 'HR', 'Interviewer']}>
              <Jobs
                token={keycloak.token}
                user={user}
              />
            </ProtectedRoute>
          } />
          
          {/* Candidates route - protected for Admin and HR */}
          <Route path="/candidates" element={
            <ProtectedRoute user={user} roles={['Admin', 'HR', 'Interviewer']}>
              <Candidates token={keycloak.token} user={user} />
            </ProtectedRoute>
          } />
          
          {/* Interviews route */}
          <Route path="/interviews" element={<Interviews token={keycloak.token} user={user} />} />
          
          {/* Users management route - restricted to Admins */}
          <Route path="/users" element={
            <ProtectedRoute user={user} roles={['Admin']}>
              <Users token={keycloak.token} />
            </ProtectedRoute>
          } />
          
          {/* Wildcard/fallback route redirecting to dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
