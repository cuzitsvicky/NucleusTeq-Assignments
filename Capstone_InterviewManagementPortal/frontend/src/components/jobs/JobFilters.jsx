/**
 * JobFilters component.
 * Renders filter controls for searching job postings by name, employment type, location, and required experience.
 */
export default function JobFilters({ filters, onChange, onClear }) {
  return (
    <div className="filters">
      {/* Search by job name/title input */}
      <input name="name" placeholder="Search by job name" value={filters.name} onChange={onChange} />
      
      {/* Job employment type dropdown filter */}
      <select name="employment_type" value={filters.employment_type} onChange={onChange}>
        <option value="">All job types</option>
        <option>Full Time</option>
        <option>Internship</option>
      </select>
      
      {/* Location filter input */}
      <input name="location" placeholder="Filter by location" value={filters.location} onChange={onChange} />
      
      {/* Experience filter input */}
      <input name="experience" placeholder="Filter by experience" value={filters.experience} onChange={onChange} />
      
      {/* Button to clear all active job filters */}
      <button type="button" onClick={onClear}>Clear filters</button>
    </div>
  );
}
