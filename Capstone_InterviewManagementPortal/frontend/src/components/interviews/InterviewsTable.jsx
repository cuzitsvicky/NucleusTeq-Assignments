import { FileText, Pencil } from 'lucide-react';
import { formatDateTime } from '../../utils/dateFormat.js';
import { canSubmitFeedback } from '../../utils/interviewHelpers.js';

export default function InterviewsTable({ interviews, user, onViewFeedback, onStartFeedback, onOpenResume, onEdit }) {
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
              <td className="interview-action-cell">
                <div className="actions interview-actions">
                  {item.feedback ? (
                    <button type="button" onClick={() => onViewFeedback(item)}>View</button>
                  ) : user?.role === 'Interviewer' ? (
                    <button type="button" disabled={!canSubmitFeedback(item)} title={!canSubmitFeedback(item) ? 'Available after scheduled time' : ''} onClick={() => onStartFeedback(item)}>Add</button>
                  ) : (
                    <span>Pending</span>
                  )}
                  {user?.role === 'HR' && item.status !== 'COMPLETED' && (
                    <button type="button" title="Edit interview" onClick={() => onEdit(item)}><Pencil size={16} />Edit</button>
                  )}
                  {user?.role === 'Interviewer' && (
                    <button type="button" title="View resume" onClick={() => onOpenResume(item.candidate_id)}><FileText size={16} />Resume</button>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
