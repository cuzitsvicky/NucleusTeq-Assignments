import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Users } from 'lucide-react';

/**
 * User Management View (Admins Only).
 * 
 * Props:
 * - token (string): Basic Auth credentials
 * - user (object): logged in user object
 */
export default function UsersView({ token, user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // Register Form State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('HR');
  const [submitError, setSubmitError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Edit Form State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUserId, setEditUserId] = useState('');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('HR');
  const [editActive, setEditActive] = useState(true);
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleOpenEditModal = (targetUser) => {
    setEditUserId(targetUser.id);
    setEditName(targetUser.name);
    setEditRole(targetUser.role);
    setEditActive(targetUser.active);
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);

    const payload = {
      name: editName,
      role: editRole,
      active: editActive
    };

    try {
      await apiService.updateUser(token, editUserId, payload);
      setIsEditOpen(false);
      fetchUsers();
    } catch (err) {
      setEditError(err.message || 'Failed to update user account.');
    } finally {
      setEditLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getUsers(token, page);
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load system users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, page]);

  const handleOpenRegisterModal = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('HR');
    setSubmitError(null);
    setIsRegisterOpen(true);
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitLoading(true);

    const payload = {
      name,
      email,
      password,
      role
    };

    try {
      await apiService.registerUser(token, payload);
      setIsRegisterOpen(false);
      fetchUsers();
    } catch (err) {
      setSubmitError(err.message || 'Failed to register new account.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleUserActive = async (targetUser) => {
    const updatedStatus = !targetUser.active;
    
    try {
      await apiService.updateUser(token, targetUser.id, {
        name: targetUser.name,
        role: targetUser.role,
        active: updatedStatus
      });
      // Refresh current page
      fetchUsers();
    } catch (err) {
      alert(`Error toggling account state: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>System User Accounts</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Provision recruiter or interviewer accounts and manage access permissions.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenRegisterModal}>
          <Plus size={18} />
          <span>Register New User</span>
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading user directories...</div>
      ) : users.length === 0 ? (
        <div className="empty-state card">
          <Users size={40} style={{ color: 'var(--text-secondary)', marginBottom: '12px' }} />
          <p>No user accounts found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Role Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id} style={{ opacity: item.active ? 1 : 0.6 }}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{item.name}</div>
                  </td>
                  <td>{item.email}</td>
                  <td>
                    <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{item.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${item.active ? 'badge-selected' : 'badge-inactive'}`}>
                      {item.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    {item.id === user.id ? (
                      <span style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current User</span>
                    ) : (
                      <div className="flex-gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEditModal(item)}
                        >
                          Edit
                        </button>
                        <button
                          className={`btn btn-sm ${item.active ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => handleToggleUserActive(item)}
                        >
                          {item.active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Register User Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New Account"
      >
        {submitError && <div className="alert alert-danger">{submitError}</div>}
        
        <form onSubmit={handleRegisterUser}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rachel Green"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Work Email (nucleusteq.com domain only)</label>
            <input
              id="reg-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rachel@nucleusteq.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-pass">Temporary Password (6-12 chars)</label>
              <input
                id="reg-pass"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-role">Account Access Role</label>
              <select
                id="reg-role"
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="HR">HR Recruiter</option>
                <option value="Interviewer">Interviewer Panelist</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0', borderTop: 'none' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsRegisterOpen(false)}
              disabled={submitLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitLoading}
            >
              {submitLoading ? 'Registering...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit User Account"
      >
        {editError && <div className="alert alert-danger">{editError}</div>}
        
        <form onSubmit={handleEditUser}>
          <div className="form-group">
            <label htmlFor="edit-name">Full Name</label>
            <input
              id="edit-name"
              type="text"
              className="form-control"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. Rachel Green"
              required
              disabled={editLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-role">Account Access Role</label>
              <select
                id="edit-role"
                className="form-control"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                required
                disabled={editLoading}
              >
                <option value="HR">HR Recruiter</option>
                <option value="Interviewer">Interviewer Panelist</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label htmlFor="edit-active-check" style={{ marginBottom: '8px' }}>Account Status</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  id="edit-active-check"
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  disabled={editLoading}
                />
                <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Account is Active</span>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0', borderTop: 'none' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditOpen(false)}
              disabled={editLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={editLoading}
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
