import { useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import { BriefcaseBusiness, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="login-panel">
        <div className="login-copy">
          <BriefcaseBusiness size={42} />
          <h1>Interview Management Portal</h1>
          <p>Manage jobs, candidates, interviews, and feedback from one focused workspace.</p>
        </div>
        <form className="box" onSubmit={submit}>
          <h2>Sign in</h2>
          <Alert message={error} type="error" onClose={() => setError('')} />
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label>Password</label>

          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button className='login button'>Login</button>
        </form>
      </div>
    </main>
  );
}
