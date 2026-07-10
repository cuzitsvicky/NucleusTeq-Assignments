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

/**
 * Users management page component (Admin only).
 * Handles adding, modifying, activating/deactivating system users,
 * and listing them with pagination and filters.
 */
export default function Users({ token }) {
  // User list and pagination states
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(false);

  // Form inputs and unmodified backups (to track unsaved changes)
  const [form, setForm] = useState(emptyUser);
  const [originalUser, setOriginalUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(''); // ID of the user currently being edited
  const [active, setActive] = useState(true); // User active status toggle state

  // Search filter options state
  const [filters, setFilters] = useState({ name: '', role: '' });

  // Alerts feedback messaging states
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');

  // Debounce search filter to limit backend database requests
  const debouncedName = useDebouncedValue(filters.name);

  /**
   * Fetches user listings from backend based on filters and page selection.
   */
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

  // Reload user list when auth token, search term, or role filter changes
  useEffect(() => {
    setPage(1);
    load(1);
  }, [token, debouncedName, filters.role]);

  /**
   * Event handler for form input changes.
   */
  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /**
   * Clears form states and hides the creation/editing form view.
   */
  function closeForm() {
    setForm(emptyUser);
    setOriginalUser(null);
    setEditingId('');
    setActive(true);
    setShowForm(false);
  }

  /**
   * Handles form submit for creating or updating a user account.
   */
  async function submit(e) {
    e.preventDefault();
    const updatePayload = { name: form.name, role: form.role, active };

    // Prevent submissions if no fields were modified in edit mode
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

  /**
   * Populates the form inputs with details of a user to enable update mode.
   */
  function editUser(user) {
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setOriginalUser({ name: user.name, role: user.role, active: user.active });
    setActive(user.active);
    setEditingId(user.id);
    setShowForm(true);
  }

  return (
    <section>
      {/* Page Header */}
      <div className="page-head">
        <h1>Users</h1>
        <button className={`add-btn ${showForm ? 'close-mode' : ''}`} onClick={showForm ? closeForm : () => setShowForm(true)}>
          {showForm ? 'Close' : <><Plus size={18} />Add User</>}
        </button>
      </div>

      {/* Global alert feedback messages */}
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
      {loading && <p>Loading...</p>}

      {/* Search filters options bar */}
      <UserFilters filters={filters} setFilters={setFilters} onClear={() => setFilters({ name: '', role: '' })} />

      {/* Creation/Editing form */}
      {showForm && (
        <UserForm form={form} editingId={editingId} active={active} setActive={setActive} onChange={change} onSubmit={submit} />
      )}

      {/* Primary users details table */}
      <UsersTable users={users} onEdit={editUser} />

      {/* Pagination control footer */}
      <Pagination pagination={pagination} loading={loading} onPageChange={load} />
    </section>
  );
}
