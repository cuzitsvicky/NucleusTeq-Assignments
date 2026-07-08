import { formatTimestamp } from '../../utils/dateFormat.js';

export default function CandidateHistory({ historyName, history, onClose }) {
  if (!historyName) return null;

  return (
    <div className="box">
      <div className="page-head">
        <h2>{historyName} History</h2>
        <button className="add-btn" onClick={onClose}>Close</button>
      </div>
      <table>
        <thead><tr><th>Status</th><th>Updated By</th><th>Time</th></tr></thead>
        <tbody>
          {history.map(item => (
            <tr key={item.id}>
              <td>{item.status}</td>
              <td>{item.updated_by}</td>
              <td>{formatTimestamp(item.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
