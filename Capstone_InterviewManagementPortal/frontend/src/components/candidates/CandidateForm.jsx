import { EXPERIENCE_PATTERN, MOBILE_PATTERN, NAME_PATTERN } from '../../utils/formConstants.js';

export default function CandidateForm({ form, jobs, editingId, onChange, onResumeChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="form">
      <input name="first_name" placeholder="First name" value={form.first_name} onChange={onChange} required maxLength="50" pattern={NAME_PATTERN} title="Only letters and spaces are allowed" />
      <input name="last_name" placeholder="Last name" value={form.last_name} onChange={onChange} required maxLength="50" pattern={NAME_PATTERN} title="Only letters and spaces are allowed" />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required pattern="[A-Za-z0-9]+(\.[A-Za-z0-9]+)*@.+" title="Use a valid email. The local part can contain letters, numbers, and dots only" />
      <input name="mobile" placeholder="Mobile" value={form.mobile} onChange={onChange} required inputMode="numeric" pattern={MOBILE_PATTERN} title="Enter 10 digits number. Spaces and hyphens are allowed" />
      <input name="current_company" placeholder="Current company" value={form.current_company} onChange={onChange} required />
      <input name="total_experience" placeholder="2 years" value={form.total_experience} onChange={onChange} required pattern={EXPERIENCE_PATTERN} title='Use formats like "3 years", "6 months", or "2 years 3 months"' />
      <select name="applied_job_id" value={form.applied_job_id} onChange={onChange} required>
        <option value="">Select applied job</option>
        {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
      </select>
      {!editingId && <input type="file" accept="application/pdf" required onChange={onResumeChange} />}
      <button>{editingId ? 'Update Candidate' : 'Create Candidate'}</button>
    </form>
  );
}
