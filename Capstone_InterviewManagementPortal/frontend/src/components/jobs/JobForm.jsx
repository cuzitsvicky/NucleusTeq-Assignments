import { EXPERIENCE_PATTERN } from '../../utils/formConstants.js';
import Alert from '../Alert.jsx';

/**
 * JobForm component.
 * Renders form fields for creating a new job posting or updating an existing one.
 * Includes text pattern validation on the experience input.
 */
export default function JobForm({ form, editingId, onChange, onSubmit, message, messageType, onClose }) {
  return (
    <form onSubmit={onSubmit} className="form">
      <Alert message={message} type={messageType} onClose={onClose} />
      {/* Job Title input */}
      <div><label>Job Title</label><input name="title" placeholder="Title" value={form.title} onChange={onChange} required maxLength="150" /></div>
      
      {/* Job Role/Designation input */}
      <div><label>Job Role</label><input name="job_role" placeholder="Job role" value={form.job_role} onChange={onChange} required /></div>
      
      {/* Required Skills input */}
      <div><label>Required Skills</label><input name="required_skills" placeholder="Required skills" value={form.required_skills} onChange={onChange} required /></div>
      
      {/* Experience level input validated against required duration formatting pattern */}
      <div><label>Experience Required</label><input 
        name="experience_required" 
        placeholder="2 years" 
        value={form.experience_required} 
        onChange={onChange} 
        required 
        pattern={EXPERIENCE_PATTERN} 
        title='Use formats like "2 years", "2-4 years", "6 months", or "2 years 3 months"' 
      /></div>
      
      {/* Employment type selector dropdown */}
      <div><label>Employment Type</label><select name="employment_type" value={form.employment_type} onChange={onChange} required>
        <option>Full Time</option>
        <option>Internship</option>
      </select></div>
      
      {/* Job Location input */}
      <div><label>Location</label><input name="location" placeholder="Location" value={form.location} onChange={onChange} required /></div>
      
      {/* Detailed Job Description textarea */}
      <div><label>Job Details</label><textarea name="job_details" placeholder="Job details" value={form.job_details} onChange={onChange} required /></div>
      
      {/* Dynamic button labels based on create/edit modes */}
      <button>{editingId ? 'Update Job' : 'Create Job'}</button>
    </form>
  );
}
