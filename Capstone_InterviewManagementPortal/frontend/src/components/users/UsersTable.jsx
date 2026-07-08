export default function UsersTable({ users, onEdit }) {
  return (
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th></tr></thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{String(user.active)}</td>
            <td>
              <div className="actions">
                <button type="button" onClick={() => onEdit(user)}>Edit</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
