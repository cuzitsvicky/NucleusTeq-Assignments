export const emptyUser = { name: '', email: '', password: '', role: 'HR' };

function normalizeEditableUser(user) {
  return {
    name: String(user.name ?? '').trim(),
    role: String(user.role ?? '').trim(),
    active: Boolean(user.active)
  };
}

export function usersAreEqual(first, second) {
  return JSON.stringify(normalizeEditableUser(first)) === JSON.stringify(normalizeEditableUser(second));
}
