/**
 * Default structure for an empty user object,
 * used for initializing user creation forms (Admin only).
 */
export const emptyUser = { name: '', email: '', password: '', role: 'HR' };

/**
 * Extracts and normalizes editable user fields.
 * Trims string values and casts active state to boolean.
 */
function normalizeEditableUser(user) {
  return {
    name: String(user.name ?? '').trim(),
    role: String(user.role ?? '').trim(),
    active: Boolean(user.active)
  };
}

/**
 * Compares two user objects after normalizing their editable fields
 * to determine if there are unsaved edits.
 */
export function usersAreEqual(first, second) {
  return JSON.stringify(normalizeEditableUser(first)) === JSON.stringify(normalizeEditableUser(second));
}
