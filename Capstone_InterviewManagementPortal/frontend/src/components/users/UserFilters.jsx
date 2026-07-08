export default function UserFilters({ filters, setFilters, onClear }) {
  return (
    <div className="filters">
      <input
        placeholder="Search by name"
        value={filters.name}
        onChange={e => setFilters(current => ({ ...current, name: e.target.value }))}
      />
      <select
        value={filters.role}
        onChange={e => setFilters(current => ({ ...current, role: e.target.value }))}
      >
        <option value="">All roles</option>
        <option>Admin</option>
        <option>HR</option>
        <option>Interviewer</option>
      </select>
      <button type="button" onClick={onClear}>Clear filters</button>
    </div>
  );
}
