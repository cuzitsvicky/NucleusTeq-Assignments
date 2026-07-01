// Maps a candidate status string → the CSS badge class defined in index.css
export const STATUS_BADGE_MAP = {
  PROFILE_CREATED:     'badge-profile',
  INTERVIEW_SCHEDULED: 'badge-scheduled',
  INTERVIEW_COMPLETED: 'badge-completed',
  SELECTED:            'badge-selected',
  REJECTED:            'badge-rejected',
};

// Maps a feedback recommendation value → CSS badge class
export const REC_BADGE_MAP = {
  SELECT:     'badge-selected',
  REJECT:     'badge-rejected',
  NEXT_ROUND: 'badge-scheduled',
};

// How many rows the backend returns per page (must match backend PAGE_SIZE)
export const PAGE_SIZE = 10;

// Rating dropdown options reused in the interview feedback form
export const RATING_OPTIONS = [
  { value: 1, label: '1 - Poor' },
  { value: 2, label: '2 - Below Average' },
  { value: 3, label: '3 - Average' },
  { value: 4, label: '4 - Above Average' },
  { value: 5, label: '5 - Excellent' },
];