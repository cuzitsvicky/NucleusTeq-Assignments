import { useEffect, useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';

const emptyUser = { name: '', email: '', password: '', role: 'HR' };

export default function Users({ token }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyUser);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [active, setActive] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');

  function load() {
    apiService.getUsers(token).then(setUsers).catch(e => {
      setMessageType('error');
      setMessage(e.message);
    });
  }

  useEffect(load, [token]);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await apiService.updateUser(token, editingId, {
          name: form.name,
          role: form.role,
          active
        });
      } else {
        await apiService.registerUser(token, form);
      }
      setForm(emptyUser);
      setEditingId('');
      setActive(true);
      setShowForm(false);
      setMessageType('success');
      setMessage(editingId ? 'User updated' : 'User created');
      load();
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    }
  }

  function editUser(user) {
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setActive(user.active);
    setEditingId(user.id);
    setShowForm(true);
  }

  function closeForm() {
    setForm(emptyUser);
    setEditingId('');
    setActive(true);
    setShowForm(false);
  }

  return (
    <section>
      <div className="page-head">
        <h1>Users</h1>
        <button className="add-btn" onClick={showForm ? closeForm : () => setShowForm(true)}>
          {showForm ? 'Close' : 'Add User'}
        </button>
      </div>
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      {showForm && (
        <form onSubmit={submit} className="form">
          <input name="name" placeholder="Name" value={form.name} onChange={change} />
          {!editingId && <input name="email" placeholder="email@nucleusteq.com" value={form.email} onChange={change} />}
          {!editingId && <input name="password" placeholder="Password" value={form.password} onChange={change} />}
          <select name="role" value={form.role} onChange={change}>
            <option>Admin</option><option>HR</option><option>Interviewer</option>
          </select>
          {editingId && (
            <select value={String(active)} onChange={e => setActive(e.target.value === 'true')}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          )}
          <button>{editingId ? 'Update User' : 'Create User'}</button>
        </form>
      )}
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{String(user.active)}</td>
              <td>
                <div className="actions">
                  <button type="button" onClick={() => editUser(user)}>Edit</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
