import pytest

from app.services import dashboard_service
from tests.conftest import async_return


@pytest.mark.asyncio
@pytest.mark.parametrize("role", ["Admin", "HR"])
async def test_get_stats_for_admin_and_hr(monkeypatch, role):
    count_jobs = async_return(10)
    count_candidates = async_return(20)
    count_interviews = async_return(30)
    monkeypatch.setattr(dashboard_service.dashboard_repo, "count_jobs", count_jobs)
    monkeypatch.setattr(dashboard_service.dashboard_repo, "count_candidates", count_candidates)
    monkeypatch.setattr(dashboard_service.dashboard_repo, "count_interviews", count_interviews)

    result = await dashboard_service.get_stats(role, "hr@nucleusteq.com")

    assert result == {
        "role": role,
        "total_jobs": 10,
        "total_candidates": 20,
        "scheduled_interviews": 30,
        "selected_candidates": 20,
        "rejected_candidates": 20,
        "full_time_jobs": 10,
        "internship_jobs": 10,
    }
    assert [call.args for call in count_jobs.await_args_list] == [
        (),
        ({"employment_type": "Full Time"},),
        ({"employment_type": "Internship"},),
    ]
    assert [call.args for call in count_candidates.await_args_list] == [
        (),
        ({"status": "SELECTED"},),
        ({"status": "REJECTED"},),
    ]
    count_interviews.assert_awaited_once_with({"status": "SCHEDULED"})


@pytest.mark.asyncio
async def test_get_stats_for_interviewer(monkeypatch):
    count_interviews = async_return(7)
    monkeypatch.setattr(dashboard_service.dashboard_repo, "count_interviews", count_interviews)

    result = await dashboard_service.get_stats("Interviewer", "interviewer@nucleusteq.com")

    assert result == {
        "role": "Interviewer",
        "assigned_interviews": 7,
        "pending_interviews": 7,
        "completed_interviews": 7,
    }
    assert [call.args for call in count_interviews.await_args_list] == [
        ({"interviewer_email": "interviewer@nucleusteq.com"},),
        ({"interviewer_email": "interviewer@nucleusteq.com", "status": "SCHEDULED"},),
        ({"interviewer_email": "interviewer@nucleusteq.com", "status": "COMPLETED"},),
    ]


@pytest.mark.asyncio
async def test_get_stats_for_unknown_role_returns_empty_dict():
    assert await dashboard_service.get_stats("Candidate", "candidate@example.com") == {}
