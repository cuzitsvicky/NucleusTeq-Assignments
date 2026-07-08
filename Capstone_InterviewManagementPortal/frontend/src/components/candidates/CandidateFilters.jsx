import { CANDIDATE_STATUS_OPTIONS } from '../../utils/formConstants.js';

export default function CandidateFilters({ filters, jobs, onChange, onClear }) {
  return (
    <div className="filters">
      <input name="name" placeholder="Search by candidate name" value={filters.name} onChange={onChange} />
      <input name="email" placeholder="Search by email" value={filters.email} onChange={onChange} />
      <select name="applied_job_id" value={filters.applied_job_id} onChange={onChange}>
        <option value="">All jobs</option>
        {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
      </select>
      <select name="status" value={filters.status} onChange={onChange}>
        <option value="">All statuses</option>
        {CANDIDATE_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <button type="button" onClick={onClear}>Clear filters</button>
    </div>
  );
}
