import pytest
from bson import ObjectId

from app.exceptions import BadRequestException, ForbiddenException, InternalServerException, NotFoundException
from app.services import candidate_service
from tests.conftest import async_return


class FakeGridIn:
    def __init__(self):
        self._id = ObjectId()
        self.writes = []
        self.closed = False

    async def write(self, data):
        self.writes.append(data)

    async def close(self):
        self.closed = True


class FakeBucket:
    def __init__(self, grid_in=None, download_bytes=b"%PDF-1.4"):
        self.grid_in = grid_in or FakeGridIn()
        self.download_bytes = download_bytes
        self.filename = None
        self.metadata = None

    def open_upload_stream(self, filename, metadata):
        self.filename = filename
        self.metadata = metadata
        return self.grid_in

    async def open_download_stream(self, resume_id):
        return self

    async def read(self):
        return self.download_bytes


def test_validate_candidate_id_rejects_invalid():
    with pytest.raises(BadRequestException) as exc:
        candidate_service.validate_candidate_id("bad")

    assert exc.value.detail == "Invalid candidate ID format"


@pytest.mark.parametrize(
    ("current_status", "new_status", "message"),
    [
        ("INTERVIEW_COMPLETED", "INTERVIEW_COMPLETED", "already in status"),
        ("SELECTED", "REJECTED", "Cannot change status once candidate"),
        ("PROFILE_CREATED", "INTERVIEW_SCHEDULED", "only be set by scheduling"),
        ("PROFILE_CREATED", "SELECTED", "only move from PROFILE_CREATED"),
        ("INTERVIEW_SCHEDULED", "SELECTED", "until the scheduled interview is completed"),
        ("INTERVIEW_COMPLETED", "PROFILE_CREATED", "Cannot revert status"),
    ],
)
def test_validate_status_transition_blocks_invalid_paths(current_status, new_status, message):
    with pytest.raises(BadRequestException) as exc:
        candidate_service.validate_status_transition(current_status, new_status)

    assert message in exc.value.detail


def test_validate_status_transition_allows_completed_to_selected_or_rejected():
    assert candidate_service.validate_status_transition("INTERVIEW_COMPLETED", "SELECTED") is None
    assert candidate_service.validate_status_transition("INTERVIEW_COMPLETED", "REJECTED") is None


def test_validate_status_transition_ignores_unknown_current_for_legacy_rows():
    assert candidate_service.validate_status_transition("LEGACY", "SELECTED") is None


def test_validate_status_transition_rejects_invalid_target():
    with pytest.raises(ValueError):
        candidate_service.validate_status_transition("INTERVIEW_COMPLETED", "BAD")


def test_status_rank_rejects_invalid_status():
    with pytest.raises(BadRequestException) as exc:
        candidate_service._status_rank("BAD")

    assert exc.value.detail == "Invalid status: BAD"


@pytest.mark.asyncio
async def test_create_candidate_success(monkeypatch, candidate_payload):
    monkeypatch.setattr(candidate_service.job_repo, "get_job_by_id", async_return({"id": "job"}))
    monkeypatch.setattr(candidate_service.candidate_repo, "get_candidate_by_email_or_mobile", async_return(None))
    monkeypatch.setattr(candidate_service.candidate_repo, "create_candidate", async_return("candidate-id"))
    add_history = async_return(None)
    monkeypatch.setattr(candidate_service.candidate_repo, "add_status_history", add_history)

    result = await candidate_service.create_candidate(candidate_payload.copy(), "hr@nucleusteq.com")

    assert result == "candidate-id"
    add_history.assert_awaited_once_with("candidate-id", "PROFILE_CREATED", "hr@nucleusteq.com")


@pytest.mark.asyncio
async def test_create_candidate_missing_job(monkeypatch, candidate_payload):
    monkeypatch.setattr(candidate_service.job_repo, "get_job_by_id", async_return(None))

    with pytest.raises(NotFoundException) as exc:
        await candidate_service.create_candidate(candidate_payload.copy(), "hr@nucleusteq.com")

    assert exc.value.detail == "Applied job not found"


@pytest.mark.asyncio
async def test_create_candidate_duplicate(monkeypatch, candidate_payload):
    monkeypatch.setattr(candidate_service.job_repo, "get_job_by_id", async_return({"id": "job"}))
    monkeypatch.setattr(candidate_service.candidate_repo, "get_candidate_by_email_or_mobile", async_return({"email": "a@example.com"}))

    with pytest.raises(BadRequestException) as exc:
        await candidate_service.create_candidate(candidate_payload.copy(), "hr@nucleusteq.com")

    assert exc.value.detail == "Email or Mobile already registered"


@pytest.mark.asyncio
async def test_upload_resume_stores_pdf_in_gridfs(monkeypatch):
    bucket = FakeBucket()
    monkeypatch.setattr(candidate_service, "get_gridfs_bucket", lambda: bucket)

    resume_id = await candidate_service.upload_resume("resume.pdf", b"%PDF-1.4")

    assert ObjectId.is_valid(resume_id)
    assert bucket.filename == "resume.pdf"
    assert bucket.metadata == {"contentType": "application/pdf"}
    assert bucket.grid_in.writes == [b"%PDF-1.4"]
    assert bucket.grid_in.closed is True


@pytest.mark.asyncio
async def test_download_resume_for_user_reads_gridfs(monkeypatch, object_ids):
    bucket = FakeBucket(download_bytes=b"%PDF-1.4 content")
    monkeypatch.setattr(candidate_service, "get_gridfs_bucket", lambda: bucket)
    monkeypatch.setattr(candidate_service, "get_resume_candidate_for_user", async_return({
        "resume_id": object_ids.candidate,
        "resume_filename": "resume.pdf",
    }))

    pdf, filename = await candidate_service.download_resume_for_user(
        object_ids.candidate,
        "HR",
        "hr@nucleusteq.com",
    )

    assert pdf == b"%PDF-1.4 content"
    assert filename == "resume.pdf"


@pytest.mark.asyncio
async def test_download_resume_for_user_wraps_gridfs_errors(monkeypatch, object_ids):
    class BrokenBucket:
        async def open_download_stream(self, resume_id):
            raise RuntimeError("boom")

    monkeypatch.setattr(candidate_service, "get_gridfs_bucket", lambda: BrokenBucket())
    monkeypatch.setattr(candidate_service, "get_resume_candidate_for_user", async_return({
        "resume_id": object_ids.candidate,
        "resume_filename": "resume.pdf",
    }))

    with pytest.raises(InternalServerException) as exc:
        await candidate_service.download_resume_for_user(
            object_ids.candidate,
            "HR",
            "hr@nucleusteq.com",
        )

    assert exc.value.detail == "Error downloading resume"


@pytest.mark.asyncio
async def test_get_candidates_attaches_job_titles(monkeypatch, object_ids):
    monkeypatch.setattr(candidate_service.candidate_repo, "get_all_candidates", async_return((
        [{"_id": ObjectId(object_ids.candidate), "applied_job_id": object_ids.job}],
        1,
    )))
    monkeypatch.setattr(candidate_service.job_repo, "get_job_by_id", async_return({"title": "Python Developer"}))

    result = await candidate_service.get_candidates()

    assert result["data"][0]["id"] == object_ids.candidate
    assert result["data"][0]["job_title"] == "Python Developer"


@pytest.mark.asyncio
async def test_get_candidates_by_ids_empty_returns_empty_page():
    result = await candidate_service.get_candidates_by_ids([])

    assert result["data"] == []
    assert result["total"] == 0


@pytest.mark.asyncio
async def test_get_candidates_by_ids_attaches_titles(monkeypatch, object_ids):
    monkeypatch.setattr(candidate_service.candidate_repo, "get_candidates_by_ids", async_return((
        [{"_id": ObjectId(object_ids.candidate), "applied_job_id": object_ids.job}],
        1,
    )))
    monkeypatch.setattr(candidate_service.job_repo, "get_job_by_id", async_return({"title": "Python"}))

    result = await candidate_service.get_candidates_by_ids([object_ids.candidate])

    assert result["data"][0]["job_title"] == "Python"


@pytest.mark.asyncio
async def test_get_candidates_for_interviewer(monkeypatch):
    monkeypatch.setattr(candidate_service.interview_repo, "get_candidate_ids_by_interviewer_email", async_return(["c1"]))
    get_by_ids = async_return({"data": [{"id": "c1"}]})
    monkeypatch.setattr(candidate_service, "get_candidates_by_ids", get_by_ids)

    result = await candidate_service.get_candidates_for_user("Interviewer", "i@nucleusteq.com")

    assert result == {"data": [{"id": "c1"}]}
    get_by_ids.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_candidates_for_hr_uses_filters(monkeypatch):
    get_candidates = async_return({"data": []})
    monkeypatch.setattr(candidate_service, "get_candidates", get_candidates)

    await candidate_service.get_candidates_for_user("HR", "hr@nucleusteq.com", name="Asha")

    get_candidates.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_candidate_by_id_missing(monkeypatch):
    monkeypatch.setattr(candidate_service.candidate_repo, "get_candidate_by_id", async_return(None))

    assert await candidate_service.get_candidate_by_id("missing") is None


@pytest.mark.asyncio
async def test_get_candidate_by_id_found(monkeypatch, object_ids):
    monkeypatch.setattr(candidate_service.candidate_repo, "get_candidate_by_id", async_return({
        "_id": ObjectId(object_ids.candidate),
        "applied_job_id": object_ids.job,
    }))
    monkeypatch.setattr(candidate_service.job_repo, "get_job_by_id", async_return({"title": "Python"}))

    result = await candidate_service.get_candidate_by_id(object_ids.candidate)

    assert result["id"] == object_ids.candidate
    assert result["job_title"] == "Python"


@pytest.mark.asyncio
async def test_get_candidate_for_user_success(monkeypatch):
    monkeypatch.setattr(candidate_service, "ensure_candidate_access", async_return(None))
    monkeypatch.setattr(candidate_service, "get_candidate_by_id", async_return({"id": "candidate-id"}))

    assert await candidate_service.get_candidate_for_user("candidate-id", "HR", "hr@nucleusteq.com") == {"id": "candidate-id"}


@pytest.mark.asyncio
async def test_get_candidate_for_user_missing(monkeypatch):
    monkeypatch.setattr(candidate_service, "ensure_candidate_access", async_return(None))
    monkeypatch.setattr(candidate_service, "get_candidate_by_id", async_return(None))

    with pytest.raises(NotFoundException):
        await candidate_service.get_candidate_for_user("candidate-id", "HR", "hr@nucleusteq.com")


@pytest.mark.asyncio
async def test_get_resume_candidate_for_user_missing_resume(monkeypatch):
    monkeypatch.setattr(candidate_service, "ensure_candidate_access", async_return(None))
    monkeypatch.setattr(candidate_service, "get_candidate_by_id", async_return({"id": "candidate-id"}))

    with pytest.raises(NotFoundException) as exc:
        await candidate_service.get_resume_candidate_for_user("candidate-id", "HR", "hr@nucleusteq.com")

    assert exc.value.detail == "Resume not found for this candidate"


@pytest.mark.asyncio
async def test_get_resume_candidate_for_user_missing_candidate(monkeypatch):
    monkeypatch.setattr(candidate_service, "ensure_candidate_access", async_return(None))
    monkeypatch.setattr(candidate_service, "get_candidate_by_id", async_return(None))

    with pytest.raises(NotFoundException) as exc:
        await candidate_service.get_resume_candidate_for_user("candidate-id", "HR", "hr@nucleusteq.com")

    assert exc.value.detail == "Candidate not found"


@pytest.mark.asyncio
async def test_get_resume_candidate_for_user_success(monkeypatch):
    monkeypatch.setattr(candidate_service, "ensure_candidate_access", async_return(None))
    monkeypatch.setattr(candidate_service, "get_candidate_by_id", async_return({"id": "candidate-id", "resume_id": "resume-id"}))

    assert await candidate_service.get_resume_candidate_for_user("candidate-id", "HR", "hr@nucleusteq.com") == {
        "id": "candidate-id",
        "resume_id": "resume-id",
    }


@pytest.mark.asyncio
async def test_update_candidate_success(monkeypatch, object_ids, candidate_payload):
    monkeypatch.setattr(candidate_service.candidate_repo, "get_candidate_by_email_or_mobile_exclude", async_return(None))
    monkeypatch.setattr(candidate_service.candidate_repo, "update_candidate", async_return(1))

    assert await candidate_service.update_candidate(object_ids.candidate, candidate_payload, "hr@nucleusteq.com") is None


@pytest.mark.asyncio
async def test_update_candidate_duplicate(monkeypatch, object_ids, candidate_payload):
    monkeypatch.setattr(candidate_service.candidate_repo, "get_candidate_by_email_or_mobile_exclude", async_return({"email": "a@example.com"}))

    with pytest.raises(BadRequestException) as exc:
        await candidate_service.update_candidate(object_ids.candidate, candidate_payload, "hr@nucleusteq.com")

    assert exc.value.detail == "Email or Mobile already registered to another candidate"


@pytest.mark.asyncio
async def test_update_candidate_no_modified_rows(monkeypatch, object_ids, candidate_payload):
    monkeypatch.setattr(candidate_service.candidate_repo, "get_candidate_by_email_or_mobile_exclude", async_return(None))
    monkeypatch.setattr(candidate_service.candidate_repo, "update_candidate", async_return(0))

    with pytest.raises(BadRequestException) as exc:
        await candidate_service.update_candidate(object_ids.candidate, candidate_payload, "hr@nucleusteq.com")

    assert exc.value.detail == "Candidate could not be updated"


@pytest.mark.asyncio
async def test_update_status_success_after_completion(monkeypatch, object_ids):
    monkeypatch.setattr(candidate_service.candidate_repo, "get_candidate_by_id", async_return({"status": "INTERVIEW_COMPLETED"}))
    monkeypatch.setattr(candidate_service.candidate_repo, "update_candidate_status", async_return(1))
    add_history = async_return(None)
    monkeypatch.setattr(candidate_service.candidate_repo, "add_status_history", add_history)

    await candidate_service.update_status(object_ids.candidate, "SELECTED", "hr@nucleusteq.com")

    add_history.assert_awaited_once_with(object_ids.candidate, "SELECTED", "hr@nucleusteq.com")


@pytest.mark.asyncio
async def test_update_status_missing_candidate(monkeypatch, object_ids):
    monkeypatch.setattr(candidate_service.candidate_repo, "get_candidate_by_id", async_return(None))

    with pytest.raises(NotFoundException):
        await candidate_service.update_status(object_ids.candidate, "SELECTED", "hr@nucleusteq.com")


@pytest.mark.asyncio
async def test_update_status_not_modified(monkeypatch, object_ids):
    monkeypatch.setattr(candidate_service.candidate_repo, "get_candidate_by_id", async_return({"status": "INTERVIEW_COMPLETED"}))
    monkeypatch.setattr(candidate_service.candidate_repo, "update_candidate_status", async_return(0))

    with pytest.raises(BadRequestException) as exc:
        await candidate_service.update_status(object_ids.candidate, "SELECTED", "hr@nucleusteq.com")

    assert exc.value.detail == "Status could not be updated"


@pytest.mark.asyncio
async def test_get_history_formats_ids(monkeypatch, object_ids):
    monkeypatch.setattr(candidate_service.candidate_repo, "get_status_history", async_return((
        [{"_id": ObjectId(), "status": "SELECTED"}],
        1,
    )))

    result = await candidate_service.get_history(object_ids.candidate)

    assert "id" in result["data"][0]
    assert result["data"][0]["status"] == "SELECTED"


@pytest.mark.asyncio
async def test_get_history_for_user_checks_access(monkeypatch):
    ensure = async_return(None)
    get_history = async_return({"data": [{"status": "SELECTED"}]})
    monkeypatch.setattr(candidate_service, "ensure_candidate_access", ensure)
    monkeypatch.setattr(candidate_service, "get_history", get_history)

    result = await candidate_service.get_history_for_user("candidate-id", "HR", "hr@nucleusteq.com", 2, 5)

    assert result == {"data": [{"status": "SELECTED"}]}
    ensure.assert_awaited_once_with(
        "candidate-id",
        "HR",
        "hr@nucleusteq.com",
        "You are not authorized to view this candidate's history",
    )
    get_history.assert_awaited_once_with("candidate-id", 2, 5)


@pytest.mark.asyncio
async def test_ensure_candidate_access_allows_non_interviewer(object_ids):
    assert await candidate_service.ensure_candidate_access(object_ids.candidate, "HR", "hr@nucleusteq.com", "Denied") is None


@pytest.mark.asyncio
async def test_ensure_candidate_access_denies_unassigned_interviewer(monkeypatch, object_ids):
    monkeypatch.setattr(candidate_service.interview_repo, "interviewer_has_candidate", async_return(False))

    with pytest.raises(ForbiddenException) as exc:
        await candidate_service.ensure_candidate_access(object_ids.candidate, "Interviewer", "i@nucleusteq.com", "Denied")

    assert exc.value.detail == "Denied"


@pytest.mark.asyncio
async def test_ensure_candidate_access_allows_assigned_interviewer(monkeypatch, object_ids):
    monkeypatch.setattr(candidate_service.interview_repo, "interviewer_has_candidate", async_return(True))

    assert await candidate_service.ensure_candidate_access(object_ids.candidate, "Interviewer", "i@nucleusteq.com", "Denied") is None


@pytest.mark.asyncio
async def test_attach_job_title_unknown(monkeypatch, object_ids):
    monkeypatch.setattr(candidate_service.job_repo, "get_job_by_id", async_return(None))
    candidate = {"_id": ObjectId(object_ids.candidate), "applied_job_id": object_ids.job}

    await candidate_service.attach_job_title(candidate)

    assert candidate["job_title"] == "Unknown"
