import logging
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Query,
    Response,
    status,
    UploadFile,
)
from pydantic import EmailStr
from ..constants import MAX_RESUME_SIZE_BYTES
from ..exceptions import (
    BadRequestException,
)
from ..schemas import (
    CandidateCreateRequest,
    CandidateResponse,
    CandidateUpdateRequest,
    MessageResponse,
    MessageWithIdResponse,
    PaginatedResponse,
    StatusHistoryResponse,
    StatusUpdateRequest,
)
from ..enums import UserRole
from ..services import candidate_service
from ..utils import require_roles
from ..validators import validate_resume_extension
from .auth import check_password_reset

router = APIRouter()
logger = logging.getLogger(__name__)


# Endpoint to create a new candidate with resume upload
@router.post(
    "/", response_model=MessageWithIdResponse, status_code=status.HTTP_201_CREATED
)
async def create_candidate(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: EmailStr = Form(...),
    mobile: str = Form(...),
    current_company: str = Form(...),
    total_experience: str = Form(...),
    applied_job_id: str = Form(...),
    resume: UploadFile = File(...),
    current_user: dict = Depends(check_password_reset),
):

    require_roles(current_user, {UserRole.HR})

    candidate_request = CandidateCreateRequest(
        first_name=first_name,
        last_name=last_name,
        email=email,
        mobile=mobile,
        current_company=current_company,
        total_experience=total_experience,
        applied_job_id=applied_job_id,
    )

    validate_resume_extension(resume.filename)

    if resume.content_type != "application/pdf":
        raise BadRequestException("Resume must be a PDF file")

    resume_bytes = await resume.read()

    if len(resume_bytes) > MAX_RESUME_SIZE_BYTES:
        raise BadRequestException("Resume file size must not exceed 5MB")

    resume_id = await candidate_service.upload_resume(resume.filename, resume_bytes)

    candidate = {
        "first_name": candidate_request.first_name,
        "last_name": candidate_request.last_name,
        "email": candidate_request.email,
        "mobile": candidate_request.mobile,
        "current_company": candidate_request.current_company,
        "total_experience": candidate_request.total_experience,
        "applied_job_id": candidate_request.applied_job_id,
        "resume_id": resume_id,
        "resume_filename": resume.filename,
    }

    candidate_id = await candidate_service.create_candidate(
        candidate, current_user["email"]
    )

    return MessageWithIdResponse(
        message="Candidate created successfully",
        id=candidate_id,
    )


# Endpoint to get a list of candidates with optional filters and pagination
@router.get("/", response_model=PaginatedResponse[CandidateResponse])
async def get_candidates(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    name: str = "",
    email: str = "",
    status: str = "",
    applied_job_id: str = "",
    current_user: dict = Depends(check_password_reset),
):
    return await candidate_service.get_candidates_for_user(
        current_user["role"],
        current_user["email"],
        page,
        limit,
        name,
        email,
        status,
        applied_job_id,
    )


# Endpoint to get a specific candidate by ID
@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(
    candidate_id: str,
    current_user: dict = Depends(check_password_reset),
):
    return await candidate_service.get_candidate_for_user(
        candidate_id,
        current_user["role"],
        current_user["email"],
    )


# Endpoint to download the resume of a specific candidate
@router.get("/{candidate_id}/resume")
async def get_resume(
    candidate_id: str,
    current_user: dict = Depends(check_password_reset),
):
    pdf, filename = await candidate_service.download_resume_for_user(
        candidate_id,
        current_user["role"],
        current_user["email"],
    )
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


# Update candidate details
@router.put("/{candidate_id}", response_model=MessageResponse)
async def update_candidate(
    candidate_id: str,
    candidate_update: CandidateUpdateRequest,
    current_user: dict = Depends(check_password_reset),
):
    require_roles(current_user, {UserRole.HR})

    await candidate_service.update_candidate(
        candidate_id,
        candidate_update.model_dump(),
        current_user["email"],
    )

    return MessageResponse(message="Candidate updated successfully")


# Update candidate status
@router.put("/{candidate_id}/status", response_model=MessageResponse)
async def update_status(
    candidate_id: str,
    status_update: StatusUpdateRequest,
    current_user: dict = Depends(check_password_reset),
):
    require_roles(current_user, {UserRole.HR})

    await candidate_service.update_status(
        candidate_id,
        status_update.status,
        current_user["email"],
    )

    return MessageResponse(message="Status updated successfully")


# Get the status history for a specific candidate with pagination
@router.get(
    "/{candidate_id}/history", response_model=PaginatedResponse[StatusHistoryResponse]
)
async def get_history(
    candidate_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(check_password_reset),
):
    return await candidate_service.get_history_for_user(
        candidate_id,
        current_user["role"],
        current_user["email"],
        page,
        limit,
    )
