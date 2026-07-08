export default function CandidatesTable({ candidates, user, onStatusChange, onOpenResume, onShowHistory, onEdit }) {
  return (
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Job</th><th>Mobile</th><th>Current Company</th><th>Total Experience</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {candidates.length === 0 ? (
          <tr>
            <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
              No candidates available. Please create a new candidate.
            </td>
          </tr>
        ) : (
          candidates.map(c => (
            <tr key={c.id}>
              <td>{c.first_name} {c.last_name}</td>
              <td>{c.email}</td>
              <td>{c.job_title || c.applied_job_id}</td>
              <td>{c.mobile}</td>
              <td>{c.current_company}</td>
              <td>{c.total_experience}</td>
              <td>{c.status}</td>
              <td>
                <div className="actions">
                  <select
                    onChange={e => onStatusChange(c.id, e.target.value)}
                    defaultValue=""
                    disabled={['PROFILE_CREATED', 'INTERVIEW_SCHEDULED'].includes(c.status)}
                    title={c.status === 'PROFILE_CREATED' ? 'Schedule an interview to move this candidate forward' : c.status === 'INTERVIEW_SCHEDULED' ? 'Available after interview feedback is submitted' : 'Change status'}
                  >
                    <option value="" disabled>{c.status === 'PROFILE_CREATED' ? 'Schedule interview' : c.status === 'INTERVIEW_SCHEDULED' ? 'Awaiting feedback' : 'Status'}</option>
                    <option>INTERVIEW_COMPLETED</option><option>SELECTED</option><option>REJECTED</option>
                  </select>
                  <button type="button" onClick={() => onOpenResume(c.id)}>Resume</button>
                  <button type="button" onClick={() => onShowHistory(c)}>History</button>
                  {user?.role === 'HR' && <button type="button" onClick={() => onEdit(c)}>Edit</button>}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
