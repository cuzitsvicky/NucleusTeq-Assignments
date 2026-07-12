import logging
from ..repositories import dashboard_repo
from ..enums import CandidateStatus, InterviewStatus, UserRole

logger = logging.getLogger(__name__)


async def get_stats(role: str, email: str):
    logger.info("Fetching dashboard statistics for role: %s, user: %s", role, email)
    if role in {UserRole.ADMIN, UserRole.HR}:
        return {
            "role": role,
            "total_jobs": await dashboard_repo.count_jobs(),
            "total_candidates": await dashboard_repo.count_candidates(),
            "scheduled_interviews": await dashboard_repo.count_interviews(
                {"status": InterviewStatus.SCHEDULED.value}
            ),
            "selected_candidates": await dashboard_repo.count_candidates(
                {"status": CandidateStatus.SELECTED.value}
            ),
            "rejected_candidates": await dashboard_repo.count_candidates(
                {"status": CandidateStatus.REJECTED.value}
            ),
            "full_time_jobs": await dashboard_repo.count_jobs(
                {"employment_type": "Full Time"}
            ),
            "internship_jobs": await dashboard_repo.count_jobs(
                {"employment_type": "Internship"}
            ),
        }
    elif role == UserRole.INTERVIEWER:
        return {
            "role": role,
            "assigned_interviews": await dashboard_repo.count_interviews(
                {"interviewer_email": email}
            ),
            "pending_interviews": await dashboard_repo.count_interviews(
                {"interviewer_email": email, "status": InterviewStatus.SCHEDULED.value}
            ),
            "completed_interviews": await dashboard_repo.count_interviews(
                {"interviewer_email": email, "status": InterviewStatus.COMPLETED.value}
            ),
        }
    return {}
