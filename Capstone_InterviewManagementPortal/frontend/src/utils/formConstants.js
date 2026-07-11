// Pattern for names: allows letters and spaces only, at least one character
export const NAME_PATTERN = '[A-Za-z ]+';

// Pattern for mobile numbers: exactly 10 digits
export const MOBILE_PATTERN = '[0-9]{10}';

// Pattern for experience strings: supports single or range values with units
// e.g., "2 years", "1-3 years", "6 months"
export const EXPERIENCE_PATTERN = '(\\d+(\\.\\d+)?(\\s*-\\s*\\d+(\\.\\d+)?)?\\s*(year|years|month|months)|\\d+\\s*(year|years)\\s+\\d+\\s*(month|months))';

// Pattern for NucleusTeq email addresses
// Format: <prefix>@nucleusteq.com
export const NUCLEUSTEQ_EMAIL_PATTERN = '[A-Za-z0-9]+(\\.[A-Za-z0-9]+)*@nucleusteq\\.com';

// Pattern for passwords: 6-12 characters, must include at least one letter, one number, and one special character
export const PASSWORD_PATTERN = '(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{6,12}';

/**
 * Array of candidate status options.
 * These values represent the different stages in the candidate lifecycle.
 */
export const CANDIDATE_STATUS_OPTIONS = [
  'PROFILE_CREATED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_COMPLETED',
  'SELECTED',
  'REJECTED'
];
