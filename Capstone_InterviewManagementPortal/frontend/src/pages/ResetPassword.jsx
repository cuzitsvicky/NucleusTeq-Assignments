import { useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPassword({ token, user, onReset }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessageType('error');
      setMessage('New password and confirm password must match');
      return;
    }

    try {
      await apiService.resetPassword(token, password);
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
        <div className="password-input">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="password-input">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
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
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
    </section>
  );
}
