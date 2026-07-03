import { useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      onLogin(await apiService.login(email, password));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="center">
      <form className="box" onSubmit={submit}>
        <h1>Interview Portal Login</h1>
        <Alert message={error} type="error" onClose={() => setError('')} />
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button>Login</button>
      </form>
    </main>
  );
}
