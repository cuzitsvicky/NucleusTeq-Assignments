import { EXPERIENCE_PATTERN } from '../../utils/formConstants.js';

export default function JobForm({ form, editingId, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="form">
      <input name="title" placeholder="Title" value={form.title} onChange={onChange} required maxLength="150" />
      <input name="job_role" placeholder="Job role" value={form.job_role} onChange={onChange} required />
      <input name="required_skills" placeholder="Required skills" value={form.required_skills} onChange={onChange} required />
      <input name="experience_required" placeholder="2 years" value={form.experience_required} onChange={onChange} required pattern={EXPERIENCE_PATTERN} title='Use formats like "2 years", "2-4 years", "6 months", or "2 years 3 months"' />
      <select name="employment_type" value={form.employment_type} onChange={onChange} required>
        <option>Full Time</option>
        <option>Internship</option>
      </select>
      <input name="location" placeholder="Location" value={form.location} onChange={onChange} required />
      <textarea name="job_details" placeholder="Job details" value={form.job_details} onChange={onChange} required />
      <button>{editingId ? 'Update Job' : 'Create Job'}</button>
    </form>
  );
}
