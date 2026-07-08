import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import Pagination from '../components/Pagination.jsx';
import UserFilters from '../components/users/UserFilters.jsx';
import UserForm from '../components/users/UserForm.jsx';
import UsersTable from '../components/users/UsersTable.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import { emptyPagination, paginationFrom } from '../utils/pagination.js';
import { emptyUser, usersAreEqual } from '../utils/userHelpers.js';

export default function Users({ token }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyUser);
  const [originalUser, setOriginalUser] = useState(null);
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

  function closeForm() {
    setForm(emptyUser);
    setOriginalUser(null);
    setEditingId('');
    setActive(true);
    setShowForm(false);
  }

  async function submit(e) {
    e.preventDefault();
    const updatePayload = { name: form.name, role: form.role, active };

    if (editingId && originalUser && usersAreEqual(updatePayload, originalUser)) {
      setMessageType('info');
      setMessage('No changes to update');
      return;
    }

    try {
      if (editingId) await apiService.updateUser(token, editingId, updatePayload);
      else await apiService.registerUser(token, form);
      closeForm();
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
    setOriginalUser({ name: user.name, role: user.role, active: user.active });
    setActive(user.active);
    setEditingId(user.id);
    setShowForm(true);
  }

  return (
    <section>
      <div className="page-head">
        <h1>Users</h1>
        <button className="add-btn" onClick={showForm ? closeForm : () => setShowForm(true)}>
          {showForm ? 'Close' : <><Plus size={18} />Add User</>}
        </button>
      </div>
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      {loading && <p>Loading...</p>}
      <UserFilters filters={filters} setFilters={setFilters} onClear={() => setFilters({ name: '', role: '' })} />
      {showForm && <UserForm form={form} editingId={editingId} active={active} setActive={setActive} onChange={change} onSubmit={submit} />}
      <UsersTable users={users} onEdit={editUser} />
      <Pagination pagination={pagination} loading={loading} onPageChange={load} />
    </section>
  );
}
