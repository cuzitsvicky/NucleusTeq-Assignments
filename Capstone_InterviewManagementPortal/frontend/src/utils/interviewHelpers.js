/**
 * Default structure for an empty interview object,
 * used for initializing form states in interview scheduling.
 */
export const emptyInterview = {
  candidate_id: '',
  job_id: '',
  job_title: '',
  interview_date: '',
  interview_time: '',
  interviewer_email: '',
  focus_areas: ''
};

/**
 * Default structure for an empty interview feedback object,
 * used when submitting feedback for completed interviews.
 */
export const emptyFeedback = {
  technical_rating: 1,
  communication_rating: 1,
  problem_solving_rating: 1,
  tech_areas_covered: '',
  comments: '',
  recommendation: 'NEXT_ROUND'
};

/**
 * Combines date and time fields to construct a JS Date object.
 * Returns null if the combination results in an invalid date.
 */
function getScheduledAt(item) {
  const scheduledAt = new Date(`${item.interview_date}T${item.interview_time || '00:00'}`);
  return Number.isNaN(scheduledAt.getTime()) ? null : scheduledAt;
}

/**
 * Checks whether an interviewer is allowed to submit feedback.
 * Feedback can only be submitted if the scheduled time has arrived or passed.
 */
export function canSubmitFeedback(item) {
  const scheduledAt = getScheduledAt(item);
  return !scheduledAt || new Date() >= scheduledAt;
}
