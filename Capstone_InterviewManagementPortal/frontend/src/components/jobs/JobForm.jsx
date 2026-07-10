import { EXPERIENCE_PATTERN } from '../../utils/formConstants.js';

/**
 * JobForm component.
 * Renders form fields for creating a new job posting or updating an existing one.
 * Includes text pattern validation on the experience input.
 */
export default function JobForm({ form, editingId, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="form">
      {/* Job Title input */}
      <input name="title" placeholder="Title" value={form.title} onChange={onChange} required maxLength="150" />
      
      {/* Job Role/Designation input */}
      <input name="job_role" placeholder="Job role" value={form.job_role} onChange={onChange} required />
      
      {/* Required Skills input */}
      <input name="required_skills" placeholder="Required skills" value={form.required_skills} onChange={onChange} required />
      
      {/* Experience level input validated against required duration formatting pattern */}
      <input 
        name="experience_required" 
        placeholder="2 years" 
        value={form.experience_required} 
        onChange={onChange} 
        required 
        pattern={EXPERIENCE_PATTERN} 
        title='Use formats like "2 years", "2-4 years", "6 months", or "2 years 3 months"' 
      />
      
      {/* Employment type selector dropdown */}
      <select name="employment_type" value={form.employment_type} onChange={onChange} required>
        <option>Full Time</option>
        <option>Internship</option>
      </select>
      
      {/* Job Location input */}
      <input name="location" placeholder="Location" value={form.location} onChange={onChange} required />
      
      {/* Detailed Job Description textarea */}
      <textarea name="job_details" placeholder="Job details" value={form.job_details} onChange={onChange} required />
      
      {/* Dynamic button labels based on create/edit modes */}
      <button>{editingId ? 'Update Job' : 'Create Job'}</button>
    </form>
  );
}
