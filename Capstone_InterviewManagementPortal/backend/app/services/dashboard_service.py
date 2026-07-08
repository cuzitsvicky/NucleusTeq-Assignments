from ..repositories import dashboard_repo


async def get_stats(role: str, email: str):
    if role in ["Admin", "HR"]:
        return {
            "role": role,
            "total_jobs": await dashboard_repo.count_jobs(),
            "total_candidates": await dashboard_repo.count_candidates(),
            "scheduled_interviews": await dashboard_repo.count_interviews(
                {"status": "SCHEDULED"}
            ),
            "selected_candidates": await dashboard_repo.count_candidates(
                {"status": "SELECTED"}
            ),
            "rejected_candidates": await dashboard_repo.count_candidates(
                {"status": "REJECTED"}
            ),
            "full_time_jobs": await dashboard_repo.count_jobs(
                {"employment_type": "Full Time"}
            ),
            "internship_jobs": await dashboard_repo.count_jobs(
                {"employment_type": "Internship"}
            ),
        }
    elif role == "Interviewer":
        return {
            "role": role,
            "assigned_interviews": await dashboard_repo.count_interviews(
                {"interviewer_email": email}
            ),
            "pending_interviews": await dashboard_repo.count_interviews(
                {"interviewer_email": email, "status": "SCHEDULED"}
            ),
            "completed_interviews": await dashboard_repo.count_interviews(
                {"interviewer_email": email, "status": "COMPLETED"}
            ),
        }
    return {}