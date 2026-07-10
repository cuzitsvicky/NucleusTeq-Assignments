import { formatTimestamp } from '../../utils/dateFormat.js';

/**
 * CandidateHistory component.
 * Renders a list/table displaying a timeline of candidate status transitions,
 * detailing status states, who made updates, and timestamps.
 */
export default function CandidateHistory({ historyName, history, onClose }) {
  // Render nothing if no history detail tracking name is selected
  if (!historyName) return null;

  return (
    <div className="box">
      <div className="page-head">
        <h2>{historyName} History</h2>
        <button className="add-btn" onClick={onClose}>Close</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Updated By</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {history.map(item => (
            <tr key={item.id}>
              <td>{item.status}</td>
              <td>{item.updated_by}</td>
              {/* Parse timestamps into custom formatting strings */}
              <td>{formatTimestamp(item.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
