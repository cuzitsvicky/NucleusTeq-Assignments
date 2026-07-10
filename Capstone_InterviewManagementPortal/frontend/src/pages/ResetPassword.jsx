import { useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import { Eye, EyeOff } from 'lucide-react';

/**
 * ResetPassword component.
 * Allows users to update their passwords. Automatically triggers re-login
 * upon successful reset to establish a new authenticated session.
 */
export default function ResetPassword({ token, user, onReset }) {
  // Input values, alert parameters, and visibility mask states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Pattern constraint: 6 to 12 characters, requiring at least one letter and one number
  const passwordPattern = '(?=.*[A-Za-z])(?=.*\\d).{6,12}';

  /**
   * Validates matching inputs and sends the password reset request to the API.
   * Logs the user in with updated credentials upon success.
   */
  async function submit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessageType('error');
      setMessage('New password and confirm password must match');
      return;
    }

    try {
      // 1. Request password change on backend
      await apiService.resetPassword(token, password);
      // 2. Perform automated re-login to retrieve updated token & profile (e.g. clears reset_required flag)
      const data = await apiService.login(user.email, password);
      setMessageType('success');
      setMessage('Password updated');
      onReset(data);
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    }
  }

  return (
    <section>
      <h1>Reset Password</h1>
      <form className="row" onSubmit={submit}>
        
        {/* New Password input with visibility toggle */}
        <div className="password-input">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength="6"
            maxLength="12"
            pattern={passwordPattern}
            title="Password must be 6 to 12 characters and include at least one letter and one digit"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password input with visibility toggle */}
        <div className="password-input">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength="6"
            maxLength="12"
            pattern={passwordPattern}
            title="Password must be 6 to 12 characters and include at least one letter and one digit"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        <button>Update</button>
      </form>

      {/* Global alert feedback messages */}
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
    </section>
  );
}
