import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Users } from 'lucide-react';


const EMPTY_REGISTER_FORM = { name: '', email: '', password: '', role: 'HR' };
const EMPTY_EDIT_FORM     = { name: '', role: 'HR', active: true };

export default function UsersView({ token, user }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  // Page is fixed at 1 for now; extend when pagination is needed
  const page = 1;

  const [isRegisterOpen,   setIsRegisterOpen]   = useState(false);
  const [registerForm,     setRegisterForm]     = useState(EMPTY_REGISTER_FORM);
  const [registerError,    setRegisterError]    = useState(null);
  const [registerLoading,  setRegisterLoading]  = useState(false);

  // Edit Modal State 
  const [isEditOpen,   setIsEditOpen]   = useState(false);
  const [editUserId,   setEditUserId]   = useState('');
  const [editForm,     setEditForm]     = useState(EMPTY_EDIT_FORM);
  const [editError,    setEditError]    = useState(null);
  const [editLoading,  setEditLoading]  = useState(false);

  // Data Fetching 

  const fetchUsers = useCallback(async () => {
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
  }, [token, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Register User 

  function openRegisterModal() {
    setRegisterForm(EMPTY_REGISTER_FORM);
    setRegisterError(null);
    setIsRegisterOpen(true);
  }

  async function handleRegisterUser(e) {
    e.preventDefault();
    setRegisterError(null);
    setRegisterLoading(true);

    try {
      await apiService.registerUser(token, registerForm);
      setIsRegisterOpen(false);
      fetchUsers();
    } catch (err) {
      setRegisterError(err.message || 'Failed to register new account.');
    } finally {
      setRegisterLoading(false);
    }
  }

  // Edit User 

  function openEditModal(targetUser) {
    setEditUserId(targetUser.id);
    setEditForm({ name: targetUser.name, role: targetUser.role, active: targetUser.active });
    setEditError(null);
    setIsEditOpen(true);
  }

  async function handleEditUser(e) {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);

    try {
      await apiService.updateUser(token, editUserId, editForm);
      setIsEditOpen(false);
      fetchUsers();
    } catch (err) {
      setEditError(err.message || 'Failed to update user account.');
    } finally {
      setEditLoading(false);
    }
  }

  // Quick Toggle Active 

  async function handleToggleActive(targetUser) {
    try {
      await apiService.updateUser(token, targetUser.id, {
        name:   targetUser.name,
        role:   targetUser.role,
        active: !targetUser.active, // flip the current value
      });
      fetchUsers();
    } catch (err) {
      alert(`Error toggling account state: ${err.message}`);
    }
  }

  // Render

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>System User Accounts</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Provision recruiter or interviewer accounts and manage access permissions.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openRegisterModal}>
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
                <th>Role</th>       
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id} style={{ opacity: item.active ? 1 : 0.6 }}>
                  <td style={{ fontWeight: '600' }}>{item.name}</td>
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
                      <span style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Current User
                      </span>
                    ) : (
                      <div className="flex-gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(item)}>
                          Edit
                        </button>
                        <button
                          className={`btn btn-sm ${item.active ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => handleToggleActive(item)}
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

      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register New Account">
        {registerError && <div className="alert alert-danger">{registerError}</div>}

        <form onSubmit={handleRegisterUser}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input id="reg-name" type="text" className="form-control"
              value={registerForm.name} placeholder="e.g. Rachel Green"
              onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))}
              required />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Work Email (nucleusteq.com domain only)</label>
            <input id="reg-email" type="email" className="form-control"
              value={registerForm.email} placeholder="e.g. rachel@nucleusteq.com"
              onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
              required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-pass">Temporary Password (6–12 chars)</label>
              <input id="reg-pass" type="password" className="form-control"
                value={registerForm.password} placeholder="Enter password"
                onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
                required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-role">Account Access Role</label>
              <select id="reg-role" className="form-control"
                value={registerForm.role}
                onChange={(e) => setRegisterForm((f) => ({ ...f, role: e.target.value }))}
                required>
                <option value="HR">HR Recruiter</option>
                <option value="Interviewer">Interviewer Panelist</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0', borderTop: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsRegisterOpen(false)} disabled={registerLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={registerLoading}>
              {registerLoading ? 'Registering...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit User Account">
        {editError && <div className="alert alert-danger">{editError}</div>}

        <form onSubmit={handleEditUser}>
          <div className="form-group">
            <label htmlFor="edit-name">Full Name</label>
            <input id="edit-name" type="text" className="form-control"
              value={editForm.name} placeholder="e.g. Rachel Green"
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              required disabled={editLoading} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-role">Account Access Role</label>
              <select id="edit-role" className="form-control"
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                required disabled={editLoading}>
                <option value="HR">HR Recruiter</option>
                <option value="Interviewer">Interviewer Panelist</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label style={{ marginBottom: '8px' }}>Account Status</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input id="edit-active-check" type="checkbox"
                  checked={editForm.active}
                  onChange={(e) => setEditForm((f) => ({ ...f, active: e.target.checked }))}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  disabled={editLoading} />
                <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Account is Active</span>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0', borderTop: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)} disabled={editLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}