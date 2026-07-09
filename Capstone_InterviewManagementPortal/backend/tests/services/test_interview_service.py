from datetime import datetime, timedelta

import pytest
from bson import ObjectId

from app.exceptions import BadRequestException, ConflictException, ForbiddenException, NotFoundException
from app.services import interview_service
from tests.conftest import async_return


def test_ensure_interview_time_has_started_allows_past_time():
    past = datetime.now() - timedelta(days=1)

    assert interview_service.ensure_interview_time_has_started({
        "interview_date": past.strftime("%Y-%m-%d"),
        "interview_time": past.strftime("%H:%M"),
    }) is None


def test_ensure_interview_time_has_started_blocks_future_time():
    future = datetime.now() + timedelta(days=1)

    with pytest.raises(BadRequestException) as exc:
        interview_service.ensure_interview_time_has_started({
            "interview_date": future.strftime("%Y-%m-%d"),
            "interview_time": future.strftime("%H:%M"),
        })

    assert exc.value.detail == "Feedback can only be submitted after the scheduled interview time"


def test_ensure_interview_time_has_started_rejects_invalid_schedule():
    with pytest.raises(BadRequestException) as exc:
        interview_service.ensure_interview_time_has_started({"interview_date": "bad"})

    assert exc.value.detail == "Interview schedule is invalid"


def test_ensure_schedule_is_future_blocks_past_time():
    past = datetime.now() - timedelta(minutes=5)

    with pytest.raises(BadRequestException) as exc:
        interview_service.ensure_schedule_is_future({
            "interview_date": past.strftime("%Y-%m-%d"),
            "interview_time": past.strftime("%H:%M"),
        })

    assert exc.value.detail == "Interview date and time must be in the future"


@pytest.mark.asyncio
async def test_schedule_interview_success(monkeypatch, interview_payload):
    monkeypatch.setattr(interview_service.candidate_repo, "get_candidate_by_id", async_return({"status": "PROFILE_CREATED"}))
    monkeypatch.setattr(interview_service.user_repo, "get_user_by_email", async_return({"role": "Interviewer", "active": True}))
    monkeypatch.setattr(interview_service.job_repo, "get_job_by_id", async_return({"id": "job"}))
    monkeypatch.setattr(interview_service.interview_repo, "get_interview_by_candidate_and_date", async_return(None))
    monkeypatch.setattr(interview_service.interview_repo, "create_interview", async_return("interview-id"))
    update_status = async_return(1)
    add_history = async_return(None)
    monkeypatch.setattr(interview_service.candidate_repo, "update_candidate_status", update_status)
    monkeypatch.setattr(interview_service.candidate_repo, "add_status_history", add_history)

    result = await interview_service.schedule_interview(interview_payload.copy(), "hr@nucleusteq.com")

    assert result == "interview-id"
    update_status.assert_awaited_once_with(interview_payload["candidate_id"], "INTERVIEW_SCHEDULED")
    add_history.assert_awaited_once_with(interview_payload["candidate_id"], "INTERVIEW_SCHEDULED", "hr@nucleusteq.com")


@pytest.mark.asyncio
async def test_schedule_interview_missing_candidate(monkeypatch, interview_payload):
    monkeypatch.setattr(interview_service.candidate_repo, "get_candidate_by_id", async_return(None))

    with pytest.raises(NotFoundException):
        await interview_service.schedule_interview(interview_payload.copy(), "hr@nucleusteq.com")


@pytest.mark.asyncio
async def test_schedule_interview_rejects_unscheduleable_status(monkeypatch, interview_payload):
    monkeypatch.setattr(interview_service.candidate_repo, "get_candidate_by_id", async_return({"status": "INTERVIEW_SCHEDULED"}))

    with pytest.raises(BadRequestException) as exc:
        await interview_service.schedule_interview(interview_payload.copy(), "hr@nucleusteq.com")

    assert "PROFILE_CREATED or INTERVIEW_COMPLETED" in exc.value.detail


@pytest.mark.asyncio
async def test_schedule_interview_missing_interviewer(monkeypatch, interview_payload):
    monkeypatch.setattr(interview_service.candidate_repo, "get_candidate_by_id", async_return({"status": "PROFILE_CREATED"}))
    monkeypatch.setattr(interview_service.user_repo, "get_user_by_email", async_return(None))

    with pytest.raises(NotFoundException) as exc:
        await interview_service.schedule_interview(interview_payload.copy(), "hr@nucleusteq.com")

    assert exc.value.detail == "Interviewer user not found"


@pytest.mark.asyncio
async def test_schedule_interview_rejects_wrong_role(monkeypatch, interview_payload):
    monkeypatch.setattr(interview_service.candidate_repo, "get_candidate_by_id", async_return({"status": "PROFILE_CREATED"}))
    monkeypatch.setattr(interview_service.user_repo, "get_user_by_email", async_return({"role": "HR"}))

    with pytest.raises(BadRequestException) as exc:
        await interview_service.schedule_interview(interview_payload.copy(), "hr@nucleusteq.com")

    assert exc.value.detail == "Assigned user must have the Interviewer role"


@pytest.mark.asyncio
async def test_schedule_interview_rejects_disabled_interviewer(monkeypatch, interview_payload):
    monkeypatch.setattr(interview_service.candidate_repo, "get_candidate_by_id", async_return({"status": "PROFILE_CREATED"}))
    monkeypatch.setattr(interview_service.user_repo, "get_user_by_email", async_return({"role": "Interviewer", "active": False}))

    with pytest.raises(BadRequestException) as exc:
        await interview_service.schedule_interview(interview_payload.copy(), "hr@nucleusteq.com")

    assert exc.value.detail == "Assigned interviewer account is disabled"


@pytest.mark.asyncio
async def test_schedule_interview_missing_job(monkeypatch, interview_payload):
    monkeypatch.setattr(interview_service.candidate_repo, "get_candidate_by_id", async_return({"status": "PROFILE_CREATED"}))
    monkeypatch.setattr(interview_service.user_repo, "get_user_by_email", async_return({"role": "Interviewer", "active": True}))
    monkeypatch.setattr(interview_service.job_repo, "get_job_by_id", async_return(None))

    with pytest.raises(NotFoundException) as exc:
        await interview_service.schedule_interview(interview_payload.copy(), "hr@nucleusteq.com")

    assert exc.value.detail == "Job not found"


@pytest.mark.asyncio
async def test_schedule_interview_duplicate(monkeypatch, interview_payload):
    monkeypatch.setattr(interview_service.candidate_repo, "get_candidate_by_id", async_return({"status": "PROFILE_CREATED"}))
    monkeypatch.setattr(interview_service.user_repo, "get_user_by_email", async_return({"role": "Interviewer", "active": True}))
    monkeypatch.setattr(interview_service.job_repo, "get_job_by_id", async_return({"id": "job"}))
    monkeypatch.setattr(interview_service.interview_repo, "get_interview_by_candidate_and_date", async_return({"id": "existing"}))

    with pytest.raises(ConflictException):
        await interview_service.schedule_interview(interview_payload.copy(), "hr@nucleusteq.com")


@pytest.mark.asyncio
async def test_get_interviews_formats_related_data(monkeypatch, object_ids):
    monkeypatch.setattr(interview_service.interview_repo, "get_all_interviews", async_return((
        [{
            "_id": ObjectId(object_ids.interview),
            "candidate_id": object_ids.candidate,
            "job_id": object_ids.job,
            "interviewer_email": "i@nucleusteq.com",
        }],
        1,
    )))
    monkeypatch.setattr(interview_service.candidate_repo, "get_candidate_by_id", async_return({"first_name": "Asha", "last_name": "Sharma"}))
    monkeypatch.setattr(interview_service.job_repo, "get_job_by_id", async_return({"title": "Python"}))
    monkeypatch.setattr(interview_service.interview_repo, "get_feedback_for_interview", async_return({"_id": ObjectId(), "comments": "Good"}))

    result = await interview_service.get_interviews("Interviewer", "i@nucleusteq.com")

    assert result["data"][0]["id"] == object_ids.interview
    assert result["data"][0]["candidate_name"] == "Asha Sharma"
    assert result["data"][0]["job_title"] == "Python"
    assert "id" in result["data"][0]["feedback"]


@pytest.mark.asyncio
async def test_get_interviews_handles_missing_related_data(monkeypatch, object_ids):
    monkeypatch.setattr(interview_service.interview_repo, "get_all_interviews", async_return((
        [{"_id": ObjectId(object_ids.interview), "candidate_id": object_ids.candidate, "job_id": object_ids.job}],
        1,
    )))
    monkeypatch.setattr(interview_service.candidate_repo, "get_candidate_by_id", async_return(None))
    monkeypatch.setattr(interview_service.job_repo, "get_job_by_id", async_return(None))
    monkeypatch.setattr(interview_service.interview_repo, "get_feedback_for_interview", async_return(None))

    result = await interview_service.get_interviews("HR", "hr@nucleusteq.com")

    assert result["data"][0]["candidate_name"] == "Unknown"
    assert result["data"][0]["job_title"] == "Unknown"
    assert result["data"][0]["feedback"] is None


@pytest.mark.asyncio
async def test_update_interview_schedule_success(monkeypatch, object_ids):
    future = datetime.now() + timedelta(days=1)
    update = async_return(1)
    monkeypatch.setattr(interview_service.interview_repo, "get_interview_by_id", async_return({"status": "SCHEDULED"}))
    monkeypatch.setattr(interview_service.interview_repo, "update_interview_schedule", update)
    payload = {
        "interview_date": future.strftime("%Y-%m-%d"),
        "interview_time": future.strftime("%H:%M"),
        "focus_areas": "React",
    }

    await interview_service.update_interview_schedule(object_ids.interview, payload)

    update.assert_awaited_once_with(object_ids.interview, payload)


@pytest.mark.asyncio
async def test_update_interview_schedule_rejects_completed(monkeypatch, object_ids):
    future = datetime.now() + timedelta(days=1)
    monkeypatch.setattr(interview_service.interview_repo, "get_interview_by_id", async_return({"status": "COMPLETED"}))

    with pytest.raises(ConflictException):
        await interview_service.update_interview_schedule(object_ids.interview, {
            "interview_date": future.strftime("%Y-%m-%d"),
            "interview_time": future.strftime("%H:%M"),
            "focus_areas": "React",
        })


@pytest.mark.asyncio
async def test_submit_feedback_success(monkeypatch, object_ids, feedback_payload):
    past = datetime.now() - timedelta(days=1)
    monkeypatch.setattr(interview_service.interview_repo, "get_interview_by_id", async_return({
        "candidate_id": object_ids.candidate,
        "interviewer_email": "interviewer@nucleusteq.com",
        "interview_date": past.strftime("%Y-%m-%d"),
        "interview_time": past.strftime("%H:%M"),
        "status": "SCHEDULED",
    }))
    monkeypatch.setattr(interview_service.interview_repo, "get_feedback_for_interview", async_return(None))
    create_feedback = async_return(None)
    monkeypatch.setattr(interview_service.interview_repo, "create_feedback", create_feedback)
    monkeypatch.setattr(interview_service.interview_repo, "update_interview_status", async_return(None))
    monkeypatch.setattr(interview_service.candidate_repo, "update_candidate_status", async_return(1))
    monkeypatch.setattr(interview_service.candidate_repo, "add_status_history", async_return(None))

    await interview_service.submit_feedback(object_ids.interview, feedback_payload.copy(), "interviewer@nucleusteq.com")

    assert create_feedback.await_args.args[0]["interview_id"] == object_ids.interview
    assert create_feedback.await_args.args[0]["interviewer_email"] == "interviewer@nucleusteq.com"


@pytest.mark.asyncio
async def test_submit_feedback_missing_interview(monkeypatch, object_ids, feedback_payload):
    monkeypatch.setattr(interview_service.interview_repo, "get_interview_by_id", async_return(None))

    with pytest.raises(NotFoundException):
        await interview_service.submit_feedback(object_ids.interview, feedback_payload, "i@nucleusteq.com")


@pytest.mark.asyncio
async def test_submit_feedback_wrong_interviewer(monkeypatch, object_ids, feedback_payload):
    monkeypatch.setattr(interview_service.interview_repo, "get_interview_by_id", async_return({"interviewer_email": "other@nucleusteq.com"}))

    with pytest.raises(ForbiddenException):
        await interview_service.submit_feedback(object_ids.interview, feedback_payload, "i@nucleusteq.com")


@pytest.mark.asyncio
async def test_submit_feedback_already_completed(monkeypatch, object_ids, feedback_payload):
    monkeypatch.setattr(interview_service.interview_repo, "get_interview_by_id", async_return({
        "interviewer_email": "i@nucleusteq.com",
        "status": "COMPLETED",
    }))

    with pytest.raises(ConflictException):
        await interview_service.submit_feedback(object_ids.interview, feedback_payload, "i@nucleusteq.com")


@pytest.mark.asyncio
async def test_submit_feedback_existing_feedback(monkeypatch, object_ids, feedback_payload):
    past = datetime.now() - timedelta(days=1)
    monkeypatch.setattr(interview_service.interview_repo, "get_interview_by_id", async_return({
        "interviewer_email": "i@nucleusteq.com",
        "interview_date": past.strftime("%Y-%m-%d"),
        "interview_time": past.strftime("%H:%M"),
        "status": "SCHEDULED",
    }))
    monkeypatch.setattr(interview_service.interview_repo, "get_feedback_for_interview", async_return({"id": "feedback"}))

    with pytest.raises(ConflictException):
        await interview_service.submit_feedback(object_ids.interview, feedback_payload, "i@nucleusteq.com")
