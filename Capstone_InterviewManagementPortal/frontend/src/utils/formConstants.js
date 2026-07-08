export const NAME_PATTERN = '[A-Za-z ]+';
export const MOBILE_PATTERN = '[0-9]{10}';
export const EXPERIENCE_PATTERN = '(\\d+(\\.\\d+)?(\\s*-\\s*\\d+(\\.\\d+)?)?\\s*(year|years|month|months)|\\d+\\s*(year|years)\\s+\\d+\\s*(month|months))';
export const NUCLEUSTEQ_EMAIL_PATTERN = '[A-Za-z0-9]+(\\.[A-Za-z0-9]+)*@nucleusteq\\.com';
export const PASSWORD_PATTERN = '(?=.*[A-Za-z])(?=.*\\d).{6,12}';

export const CANDIDATE_STATUS_OPTIONS = [
  'PROFILE_CREATED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_COMPLETED',
  'SELECTED',
  'REJECTED'
];
