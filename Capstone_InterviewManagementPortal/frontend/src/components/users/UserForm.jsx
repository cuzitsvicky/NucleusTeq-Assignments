import { NAME_PATTERN, NUCLEUSTEQ_EMAIL_PATTERN, PASSWORD_PATTERN } from '../../utils/formConstants.js';

export default function UserForm({ form, editingId, active, setActive, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="form">
      <input name="name" placeholder="Name" value={form.name} onChange={onChange} required minLength="4" maxLength="99" pattern={NAME_PATTERN} title="Only letters and spaces are allowed" />
      {!editingId && <input name="email" type="email" placeholder="email@nucleusteq.com" value={form.email} onChange={onChange} required pattern={NUCLEUSTEQ_EMAIL_PATTERN} title="Use a valid nucleusteq.com email. The local part can contain letters, numbers, and dots only" />}
      {!editingId && <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required minLength="6" maxLength="12" pattern={PASSWORD_PATTERN} title="Password must be 6 to 12 characters and include at least one letter and one digit" />}
      <select name="role" value={form.role} onChange={onChange} required>
        <option>Admin</option><option>HR</option><option>Interviewer</option>
      </select>
      {editingId && (
        <select value={String(active)} onChange={e => setActive(e.target.value === 'true')} required>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      )}
      <button>{editingId ? 'Update User' : 'Create User'}</button>
    </form>
  );
}
