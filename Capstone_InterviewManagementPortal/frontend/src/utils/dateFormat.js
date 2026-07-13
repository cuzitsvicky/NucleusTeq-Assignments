/**
 * Helper to pad single-digit numbers with a leading zero.
 * e.g. 9 -> "09"
 */
function pad(value) {
  return String(value).padStart(2, '0');
}

/**
 * Returns 'AM' or 'PM' based on a 24-hour hour value.
 */
function meridiemForHour(hour) {
  return hour >= 12 ? 'PM' : 'AM';
}

/**
 * Formats a date string or object into a standard DD/MM/YYYY format.
 * Supports parsing standard ISO date patterns (YYYY-MM-DD) directly,
 * with standard JS Date object instantiation as a fallback.
 */
export function formatDate(value) {
  if (!value) return '';

  const text = String(value).trim();
  // Fast path: match YYYY-MM-DD directly to avoid timezone shift side-effects from JS Date
  const isoDateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/**
 * Combines and formats a date and time value into a display string.
 * Automatically appends the meridiem (AM/PM) indicator to the time string.
 */
export function formatDateTime(dateValue, timeValue = '') {
  const date = formatDate(dateValue);
  const time = String(timeValue || '').trim();
  const hour = Number(time.split(':')[0]);
  const displayTime = time && Number.isInteger(hour)
    ? `${time} ${meridiemForHour(hour)}`
    : time;

  return [date, displayTime].filter(Boolean).join(' ');
}

/**
 * Formats a database/ISO timestamp into a detailed DD/MM/YYYY HH:MM AM/PM string.
 */
export function formatTimestamp(value) {
  if (!value) return '';

  const text = String(value).trim();
  const date = formatDate(text);
  const parsed = new Date(text);

  // Return formatted date portion if timestamp parsing fails
  if (Number.isNaN(parsed.getTime())) return date;

  const hours = parsed.getHours();
  return `${date} ${pad(hours)}:${pad(parsed.getMinutes())} ${meridiemForHour(hours)}`;
}
