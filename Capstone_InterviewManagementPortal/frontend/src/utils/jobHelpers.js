export const emptyJob = {
  title: '',
  job_details: '',
  job_role: '',
  required_skills: '',
  experience_required: '',
  employment_type: 'Full Time',
  location: ''
};

export const emptyJobFilters = {
  name: '',
  employment_type: '',
  location: '',
  experience: ''
};

function normalizeJob(job) {
  return Object.fromEntries(
    Object.entries(emptyJob).map(([key]) => [key, String(job[key] ?? '').trim()])
  );
}

export function jobsAreEqual(first, second) {
  return JSON.stringify(normalizeJob(first)) === JSON.stringify(normalizeJob(second));
}
