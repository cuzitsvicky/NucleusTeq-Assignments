export const emptyInterview = {
  candidate_id: '',
  job_id: '',
  job_title: '',
  interview_date: '',
  interview_time: '',
  interviewer_email: '',
  focus_areas: ''
};

export const emptyFeedback = {
  technical_rating: 1,
  communication_rating: 1,
  problem_solving_rating: 1,
  tech_areas_covered: '',
  comments: '',
  recommendation: 'NEXT_ROUND'
};

function getScheduledAt(item) {
  const scheduledAt = new Date(`${item.interview_date}T${item.interview_time || '00:00'}`);
  return Number.isNaN(scheduledAt.getTime()) ? null : scheduledAt;
}

export function canSubmitFeedback(item) {
  const scheduledAt = getScheduledAt(item);
  return !scheduledAt || new Date() >= scheduledAt;
}
