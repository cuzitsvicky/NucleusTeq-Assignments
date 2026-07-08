export default function JobFilters({ filters, onChange, onClear }) {
  return (
    <div className="filters">
      <input name="name" placeholder="Search by job name" value={filters.name} onChange={onChange} />
      <select name="employment_type" value={filters.employment_type} onChange={onChange}>
        <option value="">All job types</option>
        <option>Full Time</option>
        <option>Internship</option>
      </select>
      <input name="location" placeholder="Filter by location" value={filters.location} onChange={onChange} />
      <input name="experience" placeholder="Filter by experience" value={filters.experience} onChange={onChange} />
      <button type="button" onClick={onClear}>Clear filters</button>
    </div>
  );
}
