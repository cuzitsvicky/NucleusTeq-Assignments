import { STATUS_BADGE_MAP, REC_BADGE_MAP } from '../constants';

/**
 * Returns the CSS badge class for a candidate status string.
 * Falls back to 'badge-profile' for any unknown/undefined status.
 */
export const getStatusBadgeClass = (status) =>
  STATUS_BADGE_MAP[status] || 'badge-profile';

/**
 * Returns the CSS badge class for a feedback recommendation value.
 */
export const getRecBadgeClass = (rec) =>
  REC_BADGE_MAP[rec] || 'badge-profile';

/**
 * Returns true when a user role can create/edit records (Admin, HR).
 * Centralising this prevents spelling mistakes scattered across views.
 */
export const isRecruiterRole = (role) =>
  role === 'Admin' || role === 'HR' || role === 'Administrator';

/**
 * Returns today's date as a "YYYY-MM-DD" string.
 * Used as the `min` attribute on date input fields so users
 * cannot accidentally pick a past date.
 */
export const getTodayString = () => new Date().toISOString().split('T')[0];

/**
 * Returns the current local time as "HH:MM".
 * Used as the `min` attribute on time inputs when the chosen date is today.
 */
export const getCurrentTimeString = () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

/**
 * Formats an ISO timestamp string for human-readable display.
 * The backend sometimes omits the timezone suffix, so we append "Z" (UTC)
 * if it's missing to ensure the Date constructor parses it correctly.
 */
export const formatTimestamp = (ts) => {
  if (!ts) return '';
  const clean = ts.includes('Z') || ts.includes('+') ? ts : `${ts}Z`;
  return new Date(clean).toLocaleString();
};