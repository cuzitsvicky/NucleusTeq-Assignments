import pytest

from app.exceptions import ForbiddenException
from app.routers import interviews
from app.schemas import FeedbackSubmitRequest, InterviewCreateRequest, InterviewUpdateRequest
from tests.conftest import async_return


@pytest.mark.asyncio
async def test_schedule_interview_requires_hr(admin_user, interview_payload):
    with pytest.raises(ForbiddenException):
        await interviews.schedule_interview(InterviewCreateRequest(**interview_payload), admin_user)


@pytest.mark.asyncio
async def test_schedule_interview_success(monkeypatch, hr_user, interview_payload):
    schedule = async_return("interview-id")
    monkeypatch.setattr(interviews.interview_service, "schedule_interview", schedule)

    result = await interviews.schedule_interview(InterviewCreateRequest(**interview_payload), hr_user)

    assert result.message == "Interview scheduled"
    assert result.id == "interview-id"
    schedule.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_interviews(monkeypatch, interviewer_user):
    monkeypatch.setattr(interviews.interview_service, "get_interviews", async_return({"data": []}))

    result = await interviews.get_interviews(current_user=interviewer_user)

    assert result == {"data": []}


@pytest.mark.asyncio
async def test_update_interview_schedule_requires_hr(admin_user, object_ids, interview_payload):
    payload = InterviewUpdateRequest(**{
        "interview_date": interview_payload["interview_date"],
        "interview_time": interview_payload["interview_time"],
        "focus_areas": "Python",
    })

    with pytest.raises(ForbiddenException):
        await interviews.update_interview_schedule(object_ids.interview, payload, admin_user)


@pytest.mark.asyncio
async def test_update_interview_schedule_success(monkeypatch, hr_user, object_ids, interview_payload):
    update = async_return(None)
    monkeypatch.setattr(interviews.interview_service, "update_interview_schedule", update)
    payload = InterviewUpdateRequest(**{
        "interview_date": interview_payload["interview_date"],
        "interview_time": interview_payload["interview_time"],
        "focus_areas": "Python",
    })

    result = await interviews.update_interview_schedule(object_ids.interview, payload, hr_user)

    assert result.message == "Interview updated"
    update.assert_awaited_once()


@pytest.mark.asyncio
async def test_submit_feedback_requires_interviewer(hr_user, object_ids, feedback_payload):
    with pytest.raises(ForbiddenException):
        await interviews.submit_feedback(object_ids.interview, FeedbackSubmitRequest(**feedback_payload), hr_user)


@pytest.mark.asyncio
async def test_submit_feedback_success(monkeypatch, interviewer_user, object_ids, feedback_payload):
    submit = async_return(None)
    monkeypatch.setattr(interviews.interview_service, "submit_feedback", submit)

    result = await interviews.submit_feedback(object_ids.interview, FeedbackSubmitRequest(**feedback_payload), interviewer_user)

    assert result.message == "Feedback submitted successfully"
    submit.assert_awaited_once()
