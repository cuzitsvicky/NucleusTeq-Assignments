export default function InterviewScheduleForm({ form, candidates, interviewers, minInterviewDate, isEditing, onCandidateChange, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="form">
      <select name="candidate_id" value={form.candidate_id} onChange={onCandidateChange} disabled={isEditing} required>
        <option value="">Select candidate email</option>
        {isEditing && !candidates.some(candidate => candidate.id === form.candidate_id) && <option value={form.candidate_id}>{form.candidate_id}</option>}
        {candidates.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.email}</option>)}
      </select>
      <input name="job_title" placeholder="Job title" value={form.job_title} readOnly required />
      <input name="interview_date" type="date" min={minInterviewDate} value={form.interview_date} onChange={onChange} required />
      <input name="interview_time" type="time" value={form.interview_time} onChange={onChange} required />
      <select name="interviewer_email" value={form.interviewer_email} onChange={onChange} disabled={isEditing} required>
        <option value="">Select interviewer email</option>
        {isEditing && !interviewers.some(interviewer => interviewer.email === form.interviewer_email) && <option value={form.interviewer_email}>{form.interviewer_email}</option>}
        {interviewers.map(interviewer => <option key={interviewer.id} value={interviewer.email}>{interviewer.email}</option>)}
      </select>
      <input name="focus_areas" placeholder="Focus areas" value={form.focus_areas} onChange={onChange} required />
      <button>{isEditing ? 'Update Interview' : 'Schedule Interview'}</button>
    </form>
  );
}
