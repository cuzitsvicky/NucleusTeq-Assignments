import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { NAME_PATTERN, NUCLEUSTEQ_EMAIL_PATTERN, PASSWORD_PATTERN } from '../../utils/formConstants.js';

/**
 * UserForm component.
 * Renders form fields for creating a new user or updating an existing user's details.
 * Email and password fields are omitted during editing, and an active/inactive status toggle is added.
 */
export default function UserForm({ form, editingId, active, setActive, onChange, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="form">
      {/* Full Name input field with text formatting pattern */}
      <div><label>Full Name</label><input 
        name="name" 
        placeholder="Name" 
        value={form.name} 
        onChange={onChange} 
        required 
        minLength="4" 
        maxLength="99" 
        pattern={NAME_PATTERN} 
        title="Only letters and spaces are allowed" 
      /></div>

      {/* Email input field (visible only when creating a new user) */}
      {!editingId && (
        <div><label>Email</label><input 
          name="email" 
          type="email" 
          placeholder="email@nucleusteq.com" 
          value={form.email} 
          onChange={onChange} 
          required 
          pattern={NUCLEUSTEQ_EMAIL_PATTERN} 
          title="Use a valid nucleusteq.com email. The local part can contain letters, numbers, and dots only" 
        /></div>
      )}

      {/* Password input field (visible only when creating a new user) */}
      {!editingId && (
        <div><label>Password</label><div className="password-input">
          <input 
            name="password" 
            type={showPassword ? 'text' : 'password'} 
            placeholder="Password" 
            value={form.password} 
            onChange={onChange} 
            required 
            minLength="6" 
            maxLength="12" 
            pattern={PASSWORD_PATTERN} 
            title="Password must be 6 to 12 characters and include at least one letter, one digit, and one special character" 
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div></div>
      )}

      {/* User Role dropdown selector */}
      <div><label>User Role</label><select name="role" value={form.role} onChange={onChange} required>
        <option>Admin</option>
        <option>HR</option>
        <option>Interviewer</option>
      </select></div>

      {/* Account status dropdown selector (visible only when updating an existing user) */}
      {editingId && (
        <div><label>Account Status</label><select value={String(active)} onChange={e => setActive(e.target.value === 'true')} required>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select></div>
      )}

      {/* Dynamic button labels based on create/edit modes */}
      <button>{editingId ? 'Update User' : 'Create User'}</button>
    </form>
  );
}
