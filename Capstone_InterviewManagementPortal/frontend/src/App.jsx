import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Jobs from './pages/Jobs.jsx';
import Candidates from './pages/Candidates.jsx';
import Interviews from './pages/Interviews.jsx';
import Users from './pages/Users.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

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

export default function App() {
  const savedToken = localStorage.getItem('token');
  const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const [token, setToken] = useState(savedToken);
  const [user, setUser] = useState(savedUser);
  const navigate = useNavigate();
  const location = useLocation();

  function onLogin(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    navigate(data.user.reset_required ? '/reset-password' : '/');
  }

  function logout() {
    localStorage.clear();
    setToken(null);
    setUser(null);
    navigate('/login');
  }

  function onPasswordReset(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    navigate('/');
  }

  if (!token) return <Login onLogin={onLogin} />;

  if (user?.reset_required && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" />;
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Interview Portal</h2>
        <nav>
          <Link to="/">Dashboard</Link>
          {['Admin', 'HR'].includes(user?.role) && <Link to="/jobs">Jobs</Link>}
          {['Admin', 'HR'].includes(user?.role) && <Link to="/candidates">Candidates</Link>}
          <Link to="/interviews">Interviews</Link>
          {user?.role === 'Admin' && <Link to="/users">Users</Link>}
          <Link to="/reset-password">Reset Password</Link>
        </nav>
        <div className="account">
          <p>Logged in as {user?.role}</p>
          <span></span>
          <button onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard token={token} />} />
          <Route path="/jobs" element={
            <ProtectedRoute user={user} roles={['Admin', 'HR']}>
              <Jobs token={token} />
            </ProtectedRoute>
          } />
          <Route path="/candidates" element={
            <ProtectedRoute user={user} roles={['Admin', 'HR']}>
              <Candidates token={token} />
            </ProtectedRoute>
          } />
          <Route path="/interviews" element={<Interviews token={token} user={user} />} />
          <Route path="/users" element={
            <ProtectedRoute user={user} roles={['Admin']}>
              <Users token={token} />
            </ProtectedRoute>
          } />
          <Route path="/reset-password" element={
            <ResetPassword token={token} user={user} onReset={onPasswordReset} />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
