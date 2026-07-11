import { EXPERIENCE_PATTERN, MOBILE_PATTERN, NAME_PATTERN } from '../../utils/formConstants.js';
import Alert from '../Alert.jsx';

/**
 * CandidateForm component.
 * Renders form fields to create a new candidate or update an existing candidate profile.
 * Submissions validate string format requirements and enforce PDF resume uploads for new creations.
 */
export default function CandidateForm({ form, jobs, editingId, onChange, onResumeChange, onSubmit, message, messageType, onClose }) {
  return (
    <form onSubmit={onSubmit} className="form">
      <Alert message={message} type={messageType} onClose={onClose} />
      {/* Candidate Name inputs with formatting validators */}
      <div><label>First Name</label><input name="first_name" placeholder="First name" value={form.first_name} onChange={onChange} required maxLength="50" pattern={NAME_PATTERN} title="Only letters and spaces are allowed" /></div>
      <div><label>Last Name</label><input name="last_name" placeholder="Last name" value={form.last_name} onChange={onChange} required maxLength="50" pattern={NAME_PATTERN} title="Only letters and spaces are allowed" /></div>
      
      {/* Contact info inputs (email & mobile) */}
      <div><label>Email</label><input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required pattern="[A-Za-z0-9]+(\.[A-Za-z0-9]+)*@.+" title="Use a valid email. The local part can contain letters, numbers, and dots only" /></div>
      <div><label>Mobile</label><input name="mobile" placeholder="Mobile" value={form.mobile} onChange={onChange} required inputMode="numeric" pattern={MOBILE_PATTERN} title="Enter 10 digits number. Spaces and hyphens are allowed" /></div>
      
      {/* Professional details: company and formatted experience duration */}
      <div><label>Current Company</label><input name="current_company" placeholder="Current company" value={form.current_company} onChange={onChange} required /></div>
      <div><label>Total Experience</label><input name="total_experience" placeholder="2 years" value={form.total_experience} onChange={onChange} required pattern={EXPERIENCE_PATTERN} title='Use formats like "3 years", "6 months", or "2 years 3 months"' /></div>
      
      {/* Job opening selection dropdown */}
      <div><label>Applied Job</label><select name="applied_job_id" value={form.applied_job_id} onChange={onChange} required>
        <option value="">Select applied job</option>
        {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
      </select></div>
      
      {/* PDF resume file selection (omitted during editing) */}
      {!editingId && <div><label>Resume (PDF)</label><input type="file" accept="application/pdf" required onChange={onResumeChange} /></div>}
      
      {/* Action button */}
      <button>{editingId ? 'Update Candidate' : 'Create Candidate'}</button>
    </form>
  );
}
