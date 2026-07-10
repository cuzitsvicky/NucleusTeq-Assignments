/**
 * Default structure for an empty candidate object,
 * used for initializing form states in candidate management.
 */
export const emptyCandidate = {
  first_name: '',
  last_name: '',
  email: '',
  mobile: '',
  current_company: '',
  total_experience: '',
  applied_job_id: ''
};

/**
 * Default structure for empty candidate search/filter inputs.
 */
export const emptyCandidateFilters = { name: '', email: '', status: '', applied_job_id: '' };

/**
 * Validates candidate form submission fields.
 * Checks for missing required fields and ensures a valid PDF resume is provided
 * when adding a new candidate.
 * 
 * Returns a descriptive error message if invalid, or an empty string if valid.
 */
export function validateCandidateForm(form, resume, editingId) {
  // Map of field names to their corresponding display labels for errors
  const labels = {
    first_name: 'First name',
    last_name: 'Last name',
    email: 'Email',
    mobile: 'Mobile',
    current_company: 'Current company',
    total_experience: 'Total experience',
    applied_job_id: 'Applied job'
  };

  // Find all required fields that are empty or contain only whitespace
  const missing = Object.entries(labels)
    .filter(([key]) => !String(form[key] ?? '').trim())
    .map(([, label]) => label);

  if (missing.length) {
    return `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required`;
  }

  // Resume validation: Required and must be PDF for new candidate creation
  if (!editingId && !resume) return 'Resume is required';
  if (!editingId && resume?.type !== 'application/pdf') return 'Resume must be a PDF file';

  return '';
}

/**
 * Normalizes a candidate object by keeping only target fields
 * and trimming string values to prevent whitespace-only differences.
 */
function normalizeCandidate(candidate) {
  return Object.fromEntries(
    Object.entries(emptyCandidate).map(([key]) => [key, String(candidate[key] ?? '').trim()])
  );
}

/**
 * Compares two candidate objects after normalizing their fields
 * to determine if their core data remains identical.
 */
export function candidatesAreEqual(first, second) {
  return JSON.stringify(normalizeCandidate(first)) === JSON.stringify(normalizeCandidate(second));
}
