import Alert from '../Alert.jsx';
export default function InterviewScheduleForm({ form, candidates, interviewers, minInterviewDate, isEditing, onCandidateChange, onChange, onSubmit, message, messageType, onClose }) {
  return (
    <form onSubmit={onSubmit} className="form">
      <Alert message={message} type={messageType} onClose={onClose} />
      {/* Candidate email selection dropdown. Disabled in edit mode to prevent changing candidates mid-process */}
      <div><label>Candidate Email</label><select name="candidate_id" value={form.candidate_id} onChange={onCandidateChange} disabled={isEditing} required>
        <option value="">Select candidate email</option>
        {/* Support loading existing candidate during edit if list does not contain candidate */}
        {isEditing && !candidates.some(candidate => candidate.id === form.candidate_id) && (
          <option value={form.candidate_id}>{form.candidate_id}</option>
        )}
        {candidates.map(candidate => (
          <option key={candidate.id} value={candidate.id}>{candidate.email}</option>
        ))}
      </select></div>
      
      {/* Auto-filled read-only job title based on the selected candidate's active application */}
      <div><label>Job Title</label><input name="job_title" placeholder="Job title" value={form.job_title} readOnly required /></div>
      
      {/* Date and Time pickers */}
      <div><label>Interview Date</label><input name="interview_date" type="date" min={minInterviewDate} value={form.interview_date} onChange={onChange} required /></div>
      <div><label>Interview Time</label><input name="interview_time" type="time" value={form.interview_time} onChange={onChange} required /></div>
      
      {/* Interviewer email selector dropdown. Disabled in edit mode */}
      <div><label>Interviewer Email</label><select name="interviewer_email" value={form.interviewer_email} onChange={onChange} disabled={isEditing} required>
        <option value="">Select interviewer email</option>
        {isEditing && !interviewers.some(interviewer => interviewer.email === form.interviewer_email) && (
          <option value={form.interviewer_email}>{form.interviewer_email}</option>
        )}
        {interviewers.map(interviewer => (
          <option key={interviewer.id} value={interviewer.email}>{interviewer.email}</option>
        ))}
      </select></div>
      
      {/* Focus Areas input */}
      <div><label>Focus Areas</label><input name="focus_areas" placeholder="Focus areas" value={form.focus_areas} onChange={onChange} required /></div>
      
      {/* Submit button labels mapped to current action context */}
      <button>{isEditing ? 'Update Interview' : 'Schedule Interview'}</button>
    </form>
  );
}
