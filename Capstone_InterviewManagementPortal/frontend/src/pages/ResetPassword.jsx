import { useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';

export default function ResetPassword({ token, user, onReset }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');

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
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
        <button>Update</button>
      </form>
      <Alert message={message} type={messageType} onClose={() => setMessage('')} />
    </section>
  );
}
