import { useState } from 'react';
import { apiService } from './services/api';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import JobsView from './views/JobsView';
import CandidatesView from './views/CandidatesView';
import InterviewsView from './views/InterviewsView';
import UsersView from './views/UsersView';
import { ShieldAlert, Check, Eye, EyeOff } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('portal_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('portal_user')));
  const [view, setView] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLoginSuccess = (userToken, userProfile) => {
    setToken(userToken);
    setUser(userProfile);
    localStorage.setItem('portal_token', userToken);
    localStorage.setItem('portal_user', JSON.stringify(userProfile));
    setView('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
  };

  const handleForcedPasswordReset = async (e) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 6 || newPassword.length > 12) {
      setResetError('Password must be between 6 and 12 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);

    try {
      await apiService.resetPassword(token, newPassword);
      setResetSuccess(true);

      const authStr = `${user.email.trim().toLowerCase()}:${newPassword}`;
      const newToken = btoa(authStr);
      setToken(newToken);
      localStorage.setItem('portal_token', newToken);

      const updatedUser = { ...user, reset_required: false };
      setUser(updatedUser);
      localStorage.setItem('portal_user', JSON.stringify(updatedUser));
    } catch (err) {
      setResetError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  if (!token || !user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  if (user.reset_required) {
    return (
      <div className="reset-overlay">
        <div className="reset-card">
          <div className="text-center" style={{ marginBottom: '20px' }}>
            <ShieldAlert size={40} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '8px' }}>Security Setup Required</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              First-time login detected. You must change your password to continue.
            </p>
          </div>

          {resetError && <div className="alert alert-danger">{resetError}</div>}
          {resetSuccess && (
            <div className="alert alert-success">
              <Check size={18} />
              <span>Password updated! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleForcedPasswordReset}>
            <div className="form-group">
              <label htmlFor="new-pass">New Password (6-12 characters)</label>
              <div className="password-input-container">
                <input
                  id="new-pass"
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={resetLoading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirm-pass">Confirm Password</label>
              <div className="password-input-container">
                <input
                  id="confirm-pass"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={resetLoading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '16px', borderRadius: '8px' }}
              disabled={resetLoading}
            >
              <span>{resetLoading ? 'Saving Setup...' : 'Change Password & Continue'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView token={token} user={user} />;
      case 'jobs':
        return <JobsView token={token} user={user} />;
      case 'candidates':
        return <CandidatesView token={token} user={user} />;
      case 'interviews':
        return <InterviewsView token={token} user={user} />;
      case 'users':
        return <UsersView token={token} user={user} />;
      default:
        return <DashboardView token={token} user={user} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar 
        activeTab={view} 
        setActiveTab={setView} 
        userRole={user.role} 
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
      />

      <main className="main-content">
        <Navbar 
          title={view} 
          user={user} 
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
        />
        <div className="page-body">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
