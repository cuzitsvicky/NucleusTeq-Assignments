export const emptyCandidate = {
  first_name: '',
  last_name: '',
  email: '',
  mobile: '',
  current_company: '',
  total_experience: '',
  applied_job_id: ''
};

export const emptyCandidateFilters = { name: '', email: '', status: '', applied_job_id: '' };

export function validateCandidateForm(form, resume, editingId) {
  const labels = {
    first_name: 'First name',
    last_name: 'Last name',
    email: 'Email',
    mobile: 'Mobile',
    current_company: 'Current company',
    total_experience: 'Total experience',
    applied_job_id: 'Applied job'
  };

  const missing = Object.entries(labels)
    .filter(([key]) => !String(form[key] ?? '').trim())
    .map(([, label]) => label);

  if (missing.length) {
    return `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required`;
  }

  if (!editingId && !resume) return 'Resume is required';
  if (!editingId && resume?.type !== 'application/pdf') return 'Resume must be a PDF file';

  return '';
}

function normalizeCandidate(candidate) {
  return Object.fromEntries(
    Object.entries(emptyCandidate).map(([key]) => [key, String(candidate[key] ?? '').trim()])
  );
}

export function candidatesAreEqual(first, second) {
  return JSON.stringify(normalizeCandidate(first)) === JSON.stringify(normalizeCandidate(second));
}
