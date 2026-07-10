/**
 * InterviewScheduleForm component.
 * Renders form fields to schedule or modify candidate interviews.
 * Associates candidates with active interviewers and filters out invalid dates in the past.
 */
export default function InterviewScheduleForm({ form, candidates, interviewers, minInterviewDate, isEditing, onCandidateChange, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="form">
      {/* Candidate email selection dropdown. Disabled in edit mode to prevent changing candidates mid-process */}
      <select name="candidate_id" value={form.candidate_id} onChange={onCandidateChange} disabled={isEditing} required>
        <option value="">Select candidate email</option>
        {/* Support loading existing candidate during edit if list does not contain candidate */}
        {isEditing && !candidates.some(candidate => candidate.id === form.candidate_id) && (
          <option value={form.candidate_id}>{form.candidate_id}</option>
        )}
        {candidates.map(candidate => (
          <option key={candidate.id} value={candidate.id}>{candidate.email}</option>
        ))}
      </select>
      
      {/* Auto-filled read-only job title based on the selected candidate's active application */}
      <input name="job_title" placeholder="Job title" value={form.job_title} readOnly required />
      
      {/* Date and Time pickers */}
      <input name="interview_date" type="date" min={minInterviewDate} value={form.interview_date} onChange={onChange} required />
      <input name="interview_time" type="time" value={form.interview_time} onChange={onChange} required />
      
      {/* Interviewer email selector dropdown. Disabled in edit mode */}
      <select name="interviewer_email" value={form.interviewer_email} onChange={onChange} disabled={isEditing} required>
        <option value="">Select interviewer email</option>
        {isEditing && !interviewers.some(interviewer => interviewer.email === form.interviewer_email) && (
          <option value={form.interviewer_email}>{form.interviewer_email}</option>
        )}
        {interviewers.map(interviewer => (
          <option key={interviewer.id} value={interviewer.email}>{interviewer.email}</option>
        ))}
      </select>
      
      {/* Focus Areas input */}
      <input name="focus_areas" placeholder="Focus areas" value={form.focus_areas} onChange={onChange} required />
      
      {/* Submit button labels mapped to current action context */}
      <button>{isEditing ? 'Update Interview' : 'Schedule Interview'}</button>
    </form>
  );
}
