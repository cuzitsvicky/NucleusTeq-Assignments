import { useEffect, useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import Pagination from '../components/Pagination.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import { emptyPagination, paginationFrom } from '../utils/pagination.js';

const emptyUser = { name: '', email: '', password: '', role: 'HR' };

export default function Users({ token }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyUser);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [active, setActive] = useState(true);
  const [filters, setFilters] = useState({ name: '', role: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const debouncedName = useDebouncedValue(filters.name);

  function load(nextPage = page) {
    setLoading(true);
    apiService.getUsers(token, nextPage, pagination.limit, {
      name: debouncedName,
      role: filters.role
    }).then(response => {
      setUsers(response.data);
      setPage(response.page);
      setPagination(paginationFrom(response));
    }).catch(e => {
      setMessageType('error');
      setMessage(e.message);
    }).finally(() => {
      setLoading(false);
    });
  }

  useEffect(() => {
    setPage(1);
    load(1);
  }, [token, debouncedName, filters.role]);

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
      {loading && <p>Loading...</p>}
      <div className="filters">
        <input
          placeholder="Search by name"
          value={filters.name}
          onChange={e => setFilters({ ...filters, name: e.target.value })}
        />
        <select
  value={filters.role}
  onChange={e =>
    setFilters(current => ({
      ...current,
      role: e.target.value,
    }))
  }
>
          <option value="">All roles</option>
          <option>Admin</option>
          <option>HR</option>
          <option>Interviewer</option>
        </select>
      </div>
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
      <Pagination
        pagination={pagination}
        loading={loading}
        onPageChange={load}
      />
    </section>
  );
}
