import pytest
from bson import ObjectId

from app.exceptions import BadRequestException, ForbiddenException, InternalServerException
from app.routers import candidates
from app.schemas import CandidateUpdateRequest, StatusUpdateRequest
from tests.conftest import async_return


class FakeUploadFile:
    def __init__(self, filename="resume.pdf", content_type="application/pdf", content=b"%PDF-1.4"):
        self.filename = filename
        self.content_type = content_type
        self.content = content

    async def read(self):
        return self.content


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


def test_require_hr_allows_hr(hr_user):
    assert candidates.require_hr(hr_user) is None


def test_require_hr_blocks_non_hr(admin_user):
    with pytest.raises(ForbiddenException):
        candidates.require_hr(admin_user)


@pytest.mark.asyncio
async def test_create_candidate_success(monkeypatch, hr_user, object_ids):
    bucket = FakeBucket()
    monkeypatch.setattr(candidates, "get_gridfs_bucket", lambda: bucket)
    create = async_return("candidate-id")
    monkeypatch.setattr(candidates.candidate_service, "create_candidate", create)

    result = await candidates.create_candidate(
        first_name="Asha",
        last_name="Sharma",
        email="asha@example.com",
        mobile="9876543210",
        current_company="NucleusTeq",
        total_experience="3 years",
        applied_job_id=object_ids.job,
        resume=FakeUploadFile(),
        current_user=hr_user,
    )

    assert result == {"message": "Candidate created successfully", "id": "candidate-id"}
    assert bucket.filename == "resume.pdf"
    assert bucket.metadata == {"contentType": "application/pdf"}
    assert create.await_args.args[0]["resume_filename"] == "resume.pdf"


@pytest.mark.asyncio
async def test_create_candidate_rejects_non_pdf_content_type(hr_user, object_ids):
    with pytest.raises(BadRequestException) as exc:
        await candidates.create_candidate(
            first_name="Asha",
            last_name="Sharma",
            email="asha@example.com",
            mobile="9876543210",
            current_company="NucleusTeq",
            total_experience="3 years",
            applied_job_id=object_ids.job,
            resume=FakeUploadFile(content_type="text/plain"),
            current_user=hr_user,
        )

    assert exc.value.detail == "Resume must be a PDF file"


@pytest.mark.asyncio
async def test_create_candidate_rejects_large_resume(hr_user, object_ids):
    with pytest.raises(BadRequestException) as exc:
        await candidates.create_candidate(
            first_name="Asha",
            last_name="Sharma",
            email="asha@example.com",
            mobile="9876543210",
            current_company="NucleusTeq",
            total_experience="3 years",
            applied_job_id=object_ids.job,
            resume=FakeUploadFile(content=b"x" * (candidates.MAX_RESUME_SIZE_BYTES + 1)),
            current_user=hr_user,
        )

    assert exc.value.detail == "Resume file size must not exceed 5MB"


@pytest.mark.asyncio
async def test_get_candidates(monkeypatch, hr_user):
    get_for_user = async_return({"data": []})
    monkeypatch.setattr(candidates.candidate_service, "get_candidates_for_user", get_for_user)

    result = await candidates.get_candidates(current_user=hr_user, name="Asha")

    assert result == {"data": []}
    get_for_user.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_candidate(monkeypatch, hr_user):
    monkeypatch.setattr(candidates.candidate_service, "get_candidate_for_user", async_return({"id": "candidate-id"}))

    assert await candidates.get_candidate("candidate-id", hr_user) == {"id": "candidate-id"}


@pytest.mark.asyncio
async def test_get_resume_success(monkeypatch, hr_user, object_ids):
    bucket = FakeBucket(download_bytes=b"%PDF-1.4 content")
    monkeypatch.setattr(candidates, "get_gridfs_bucket", lambda: bucket)
    monkeypatch.setattr(candidates.candidate_service, "get_resume_candidate_for_user", async_return({
        "resume_id": object_ids.candidate,
        "resume_filename": "resume.pdf",
    }))

    response = await candidates.get_resume("candidate-id", hr_user)

    assert response.media_type == "application/pdf"
    assert response.body == b"%PDF-1.4 content"


@pytest.mark.asyncio
async def test_get_resume_wraps_download_errors(monkeypatch, hr_user, object_ids):
    class BrokenBucket:
        async def open_download_stream(self, resume_id):
            raise RuntimeError("boom")

    monkeypatch.setattr(candidates, "get_gridfs_bucket", lambda: BrokenBucket())
    monkeypatch.setattr(candidates.candidate_service, "get_resume_candidate_for_user", async_return({
        "resume_id": object_ids.candidate,
        "resume_filename": "resume.pdf",
    }))

    with pytest.raises(InternalServerException) as exc:
        await candidates.get_resume("candidate-id", hr_user)

    assert exc.value.detail == "Error downloading resume"


@pytest.mark.asyncio
async def test_update_candidate_requires_hr(admin_user, candidate_payload, object_ids):
    with pytest.raises(ForbiddenException):
        await candidates.update_candidate(
            object_ids.candidate,
            CandidateUpdateRequest(**candidate_payload),
            admin_user,
        )


@pytest.mark.asyncio
async def test_update_candidate_success(monkeypatch, hr_user, candidate_payload, object_ids):
    update = async_return(None)
    monkeypatch.setattr(candidates.candidate_service, "update_candidate", update)

    result = await candidates.update_candidate(
        object_ids.candidate,
        CandidateUpdateRequest(**candidate_payload),
        hr_user,
    )

    assert result == {"message": "Candidate updated successfully"}
    update.assert_awaited_once()


@pytest.mark.asyncio
async def test_update_status_success(monkeypatch, hr_user, object_ids):
    update = async_return(None)
    monkeypatch.setattr(candidates.candidate_service, "update_status", update)

    result = await candidates.update_status(
        object_ids.candidate,
        StatusUpdateRequest(status="SELECTED"),
        hr_user,
    )

    assert result == {"message": "Status updated successfully"}
    update.assert_awaited_once_with(object_ids.candidate, "SELECTED", "hr@nucleusteq.com")


@pytest.mark.asyncio
async def test_get_history(monkeypatch, hr_user, object_ids):
    monkeypatch.setattr(candidates.candidate_service, "get_history_for_user", async_return({"data": []}))

    assert await candidates.get_history(object_ids.candidate, current_user=hr_user) == {"data": []}
