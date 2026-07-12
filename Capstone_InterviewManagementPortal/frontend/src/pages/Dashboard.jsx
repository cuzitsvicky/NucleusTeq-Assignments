import { useEffect, useState } from 'react';
import { apiService } from '../apiService.js';
import Alert from '../components/Alert.jsx';
import { BarChart3 } from 'lucide-react';

/**
 * Dashboard landing page component.
 * Fetches general system statistics from the backend and renders them in responsive card grids.
 */
export default function Dashboard({ token }) {
  // Statistics key-value pairs fetched from backend (e.g. jobs, candidates counts)
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');

  // Fetch dashboard stats once on mount or when authentication token updates
  useEffect(() => {
    apiService.getDashboardStats(token)
      .then(setStats)
      .catch(e => setError(e.message));
  }, [token]);

  return (
    <section>
      <h1>Dashboard</h1>
      
      {/* Dynamic error alert display */}
      <Alert message={error} type="error" onClose={() => setError('')} />
      
      {/* Grid displaying statistical metric cards */}
      <div className="grid">
        {Object.entries(stats).map(([key, value]) => (
          <div className="card" key={key}>
            <BarChart3 className="card-icon" size={22} />
            {/* Format keys like 'total_candidates' into user-friendly 'TOTAL CANDIDATES' labels */}
            <b>{key.replaceAll('_', ' ').toUpperCase()}</b>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
