import logging
from bson.objectid import ObjectId
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Query,
    Response,
    UploadFile,
)
from pydantic import EmailStr
from ..constants import MAX_RESUME_SIZE_BYTES
from ..core.database import get_gridfs_bucket
from ..exceptions import (
    BadRequestException,
    ForbiddenException,
    InternalServerException,
)
from ..schemas import (
    CandidateCreateRequest,
    CandidateResponse,
    CandidateUpdateRequest,
    PaginatedResponse,
    StatusHistoryResponse,
    StatusUpdateRequest,
)
from ..services import candidate_service
from ..validators import (validate_resume_extension)
from .auth import check_password_reset

router = APIRouter()
logger = logging.getLogger(__name__)


# Helper function to check if the user has HR role
def require_hr(user: dict):
    
    if user["role"] not in ["HR"]:
        raise ForbiddenException("Not authorized")


# Endpoint to create a new candidate with resume upload
@router.post("/")
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
    
    require_hr(current_user)

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

    fs = get_gridfs_bucket()

    grid_in = fs.open_upload_stream(
        filename=resume.filename,
        metadata={"contentType": "application/pdf"}
    )

    await grid_in.write(resume_bytes)
    await grid_in.close()

    candidate = {
       "first_name": candidate_request.first_name,
       "last_name": candidate_request.last_name,
       "email": candidate_request.email,
       "mobile": candidate_request.mobile,
       "current_company": candidate_request.current_company,
       "total_experience": candidate_request.total_experience,
       "applied_job_id": candidate_request.applied_job_id,
       "resume_id": str(grid_in._id),
       "resume_filename": resume.filename,
    }

    candidate_id = await candidate_service.create_candidate(candidate, current_user["email"])

    return {
        "message": "Candidate created successfully",
        "id": candidate_id,
    }


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
    candidate = await candidate_service.get_resume_candidate_for_user(
        candidate_id,
        current_user["role"],
        current_user["email"],
    )

    try:
        fs = get_gridfs_bucket()

        grid_file = await fs.open_download_stream(ObjectId(candidate["resume_id"]))

        pdf = await grid_file.read()

        return Response(
            content=pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": f'inline; filename="{candidate["resume_filename"]}"'}
        )

    except Exception:
        logger.exception("Error downloading resume for %s", candidate_id)
        raise InternalServerException("Error downloading resume")


# Update candidate details
@router.put("/{candidate_id}")
async def update_candidate(
    candidate_id: str,
    candidate_update: CandidateUpdateRequest,
    current_user: dict = Depends(check_password_reset),
):
    require_hr(current_user)

    await candidate_service.update_candidate(
        candidate_id,
        candidate_update.model_dump(),
        current_user["email"],
    )

    return {"message": "Candidate updated successfully"}


# Update candidate status
@router.put("/{candidate_id}/status")
async def update_status(
    candidate_id: str,
    status_update: StatusUpdateRequest,
    current_user: dict = Depends(check_password_reset),
):
    require_hr(current_user)

    await candidate_service.update_status(
        candidate_id,
        status_update.status,
        current_user["email"],
    )

    return {"message": "Status updated successfully"}


# Get the status history for a specific candidate with pagination
@router.get("/{candidate_id}/history", response_model=PaginatedResponse[StatusHistoryResponse])
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