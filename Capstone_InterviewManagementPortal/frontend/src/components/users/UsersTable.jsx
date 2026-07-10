/**
 * UsersTable component.
 * Renders a tabular list of system users, including name, email, role,
 * active status, and an edit action button (Admin only).
 */
export default function UsersTable({ users, onEdit }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Active</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            {/* Convert boolean active state to text string ("true" / "false") for display */}
            <td>{String(user.active)}</td>
            <td>
              <div className="actions">
                {/* Trigger user edit action panel */}
                <button type="button" onClick={() => onEdit(user)}>Edit</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
