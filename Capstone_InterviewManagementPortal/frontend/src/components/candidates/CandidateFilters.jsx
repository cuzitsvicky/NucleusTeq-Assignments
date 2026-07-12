import { CANDIDATE_STATUS_OPTIONS } from '../../utils/formConstants.js';

/**
 * CandidateFilters component.
 * Renders search and selection filters to lookup candidates by name, email, applied job, and profile status.
 */
export default function CandidateFilters({ filters, jobs, onChange, onClear }) {
  return (
    <div className="filters">
      {/* Search by name and email inputs */}
      <input name="name" placeholder="Search by candidate name" value={filters.name} onChange={onChange} />
      <input name="email" placeholder="Search by email" value={filters.email} onChange={onChange} />
      
      {/* Search filter for applied job */}
      <select name="applied_job_id" value={filters.applied_job_id} onChange={onChange}>
        <option value="">All jobs</option>
        {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
      </select>
      
      {/* Search filter for candidate application status */}
      <select name="status" value={filters.status} onChange={onChange}>
        <option value="">All statuses</option>
        {CANDIDATE_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      
      {/* Button to reset all search parameters */}
      <button type="button" onClick={onClear}>Clear filters</button>
    </div>
  );
}
