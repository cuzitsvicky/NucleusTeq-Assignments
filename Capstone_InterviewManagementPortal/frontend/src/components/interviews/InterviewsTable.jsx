import { formatDateTime } from '../../utils/dateFormat.js';
import { canSubmitFeedback } from '../../utils/interviewHelpers.js';

export default function InterviewsTable({ interviews, user, onViewFeedback, onStartFeedback }) {
  return (
    <table>
      <thead><tr><th>Candidate</th><th>Job</th><th>Date</th><th>Interviewer</th><th>Status</th><th>Feedback</th></tr></thead>
      <tbody>
        {interviews.length === 0 ? (
          <tr><td colSpan="6" style={{ textAlign: 'center' }}>No interviews scheduled</td></tr>
        ) : (
          interviews.map(item => (
            <tr key={item.id}>
              <td>{item.candidate_name}</td>
              <td>{item.job_title}</td>
              <td>{formatDateTime(item.interview_date, item.interview_time)}</td>
              <td>{item.interviewer_email}</td>
              <td>{item.status}</td>
              <td>
                {item.feedback ? (
                  <div className="actions"><button type="button" onClick={() => onViewFeedback(item)}>View</button></div>
                ) : user?.role === 'Interviewer' ? (
                  <div className="actions">
                    <button type="button" disabled={!canSubmitFeedback(item)} title={!canSubmitFeedback(item) ? 'Available after scheduled time' : ''} onClick={() => onStartFeedback(item)}>Add</button>
                  </div>
                ) : (
                  'Pending'
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
