/**
 * Default structure for an empty job object,
 * used for initializing form states in job creation/editing.
 */
export const emptyJob = {
  title: '',
  job_details: '',
  job_role: '',
  required_skills: '',
  experience_required: '',
  employment_type: 'Full Time',
  location: ''
};

/**
 * Default structure for empty job search/filter inputs.
 */
export const emptyJobFilters = {
  name: '',
  employment_type: '',
  location: '',
  experience: ''
};

/**
 * Normalizes a job object by keeping only target fields
 * and trimming string values to prevent whitespace-only differences.
 */
function normalizeJob(job) {
  return Object.fromEntries(
    Object.entries(emptyJob).map(([key]) => [key, String(job[key] ?? '').trim()])
  );
}

/**
 * Compares two job objects after normalizing their fields
 * to determine if their core data remains identical.
 */
export function jobsAreEqual(first, second) {
  return JSON.stringify(normalizeJob(first)) === JSON.stringify(normalizeJob(second));
}
