import { useEffect, useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';

export default function Dashboard({ token }) {
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    apiService.getDashboardStats(token).then(setStats).catch(e => setError(e.message));
  }, [token]);

  return (
    <section>
      <h1>Dashboard</h1>
      <Alert message={error} type="error" onClose={() => setError('')} />
      <div className="grid">
        {Object.entries(stats).map(([key, value]) => (
          <div className="card" key={key}>
            <b>{key.replaceAll('_', ' ')}</b>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
