import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Jobs from './pages/Jobs.jsx';
import Candidates from './pages/Candidates.jsx';
import Interviews from './pages/Interviews.jsx';
import Users from './pages/Users.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import { BriefcaseBusiness, CalendarCheck, Gauge, KeyRound, UsersRound, UserRoundCog, Menu } from 'lucide-react';

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
export default function App() {
  // Retrieve saved credentials and user info from localStorage to maintain session on reload
  const savedToken = localStorage.getItem('token');
  const savedUser = JSON.parse(localStorage.getItem('user') || 'null');

  // React state for auth token and user profile details
  const [token, setToken] = useState(savedToken);
  const [user, setUser] = useState(savedUser);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Callback invoked upon successful login.
   * Updates state and localStorage with authenticated user data, and navigates appropriately.
   */
  function onLogin(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    // Redirect to reset password if backend flags password reset is required (e.g. temporary password)
    navigate(data.user.reset_required ? '/reset-password' : '/');
  }

  /**
   * Logs the current user out by clearing local storage and resetting authentication state.
   */
  function logout() {
    localStorage.clear();
    setToken(null);
    setUser(null);
    navigate('/login');
  }

  /**
   * Callback invoked after a successful password reset.
   * Updates the authentication state and redirects the user to the dashboard.
   */
  function onPasswordReset(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    navigate('/');
  }

  // Auth Guard: Render login page if the user is not authenticated
  if (!token) return <Login onLogin={onLogin} />;

  // Force redirection to Reset Password page if required by the user profile
  if (user?.reset_required && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" />;
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
          
          {/* Password reset link */}
          <Link to="/reset-password"><KeyRound size={17} />Reset Password</Link>
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
          <Route path="/" element={<Dashboard token={token} />} />
          
          {/* Jobs route - protected for Admin, HR, and Interviewers */}
          <Route path="/jobs" element={
            <ProtectedRoute user={user} roles={['Admin', 'HR', 'Interviewer']}>
              <Jobs
                token={token}
                user={user}
              />
            </ProtectedRoute>
          } />
          
          {/* Candidates route - protected for Admin and HR */}
          <Route path="/candidates" element={
            <ProtectedRoute user={user} roles={['Admin', 'HR', 'Interviewer']}>
              <Candidates token={token} user={user} />
            </ProtectedRoute>
          } />
          
          {/* Interviews route */}
          <Route path="/interviews" element={<Interviews token={token} user={user} />} />
          
          {/* Users management route - restricted to Admins */}
          <Route path="/users" element={
            <ProtectedRoute user={user} roles={['Admin']}>
              <Users token={token} />
            </ProtectedRoute>
          } />
          
          {/* Reset Password route */}
          <Route path="/reset-password" element={
            <ResetPassword token={token} user={user} onReset={onPasswordReset} />
          } />
          
          {/* Wildcard/fallback route redirecting to dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
