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
    logger.info("API request to create candidate: %s %s by HR user: %s", first_name, last_name, current_user["email"])

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
        logger.warning("Candidate creation failed. Resume must be a PDF file: %s", resume.content_type)
        raise BadRequestException("Resume must be a PDF file")

    resume_bytes = await resume.read()

    if len(resume_bytes) > MAX_RESUME_SIZE_BYTES:
        logger.warning("Candidate creation failed. Resume file size (%d bytes) exceeds maximum limit", len(resume_bytes))
        raise BadRequestException("Resume file size must not exceed 5MB")

    resume_id = await candidate_service.upload_resume(resume.filename, resume_bytes)
    logger.info("Resume uploaded successfully with ID: %s", resume_id)

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

    logger.info("Candidate %s created successfully with ID: %s by %s", candidate_request.email, candidate_id, current_user["email"])
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
    logger.info("API request to fetch candidates by user: %s (role: %s), page: %d, limit: %d", current_user["email"], current_user["role"], page, limit)
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
    logger.info("API request to fetch candidate details for ID: %s by user: %s", candidate_id, current_user["email"])
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
    logger.info("API request to download resume for candidate ID: %s by user: %s", candidate_id, current_user["email"])
    pdf, filename = await candidate_service.download_resume_for_user(
        candidate_id,
        current_user["role"],
        current_user["email"],
    )
    logger.info("Resume downloaded successfully for candidate ID: %s", candidate_id)
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
    logger.info("API request to update candidate ID: %s details by user: %s", candidate_id, current_user["email"])

    await candidate_service.update_candidate(
        candidate_id,
        candidate_update.model_dump(),
        current_user["email"],
    )

    logger.info("Candidate ID: %s updated successfully", candidate_id)
    return MessageResponse(message="Candidate updated successfully")


# Update candidate status
@router.put("/{candidate_id}/status", response_model=MessageResponse)
async def update_status(
    candidate_id: str,
    status_update: StatusUpdateRequest,
    current_user: dict = Depends(check_password_reset),
):
    require_roles(current_user, {UserRole.HR})
    logger.info("API request to update candidate ID: %s status to %s by user: %s", candidate_id, status_update.status, current_user["email"])

    await candidate_service.update_status(
        candidate_id,
        status_update.status,
        current_user["email"],
    )

    logger.info("Candidate ID: %s status updated successfully to %s", candidate_id, status_update.status)
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
    logger.info("API request to fetch status history for candidate ID: %s by user: %s, page: %d, limit: %d", candidate_id, current_user["email"], page, limit)
    return await candidate_service.get_history_for_user(
        candidate_id,
        current_user["role"],
        current_user["email"],
        page,
        limit,
    )
