/**
 * UserFilters component.
 * Renders filter controls for searching system users by name and role.
 */
export default function UserFilters({ filters, setFilters, onClear }) {
  return (
    <div className="filters">
      {/* Name search input field */}
      <input
        placeholder="Search by name"
        value={filters.name}
        onChange={e => setFilters(current => ({ ...current, name: e.target.value }))}
      />

      {/* Role filter dropdown selector */}
      <select
        value={filters.role}
        onChange={e => setFilters(current => ({ ...current, role: e.target.value }))}
      >
        <option value="">All roles</option>
        <option>Admin</option>
        <option>HR</option>
        <option>Interviewer</option>
      </select>
      
      {/* Button to reset all active filters */}
      <button type="button" onClick={onClear}>Clear filters</button>
    </div>
  );
}
