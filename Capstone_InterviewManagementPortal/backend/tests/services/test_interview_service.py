from datetime import datetime, timedelta

import pytest

from app.exceptions import BadRequestException
from app.services.interview_service import ensure_interview_time_has_started


def test_feedback_before_scheduled_time_is_blocked():
    scheduled_at = datetime.now() + timedelta(hours=1)

    with pytest.raises(BadRequestException):
        ensure_interview_time_has_started({
            "interview_date": scheduled_at.strftime("%Y-%m-%d"),
            "interview_time": scheduled_at.strftime("%H:%M"),
        })


def test_feedback_after_scheduled_time_is_allowed():
    scheduled_at = datetime.now() - timedelta(minutes=1)

    ensure_interview_time_has_started({
        "interview_date": scheduled_at.strftime("%Y-%m-%d"),
        "interview_time": scheduled_at.strftime("%H:%M"),
    })
