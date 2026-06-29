from ..repositories import job_repo


async def create_job(job_data: dict):
    job_id = await job_repo.create_job(job_data)
    job_data["id"] = job_id
    return job_data


async def get_jobs(page: int = 1):
    jobs = await job_repo.get_all_jobs(page=page)
    for j in jobs:
        j["id"] = str(j.pop("_id"))
    return jobs


async def get_job_by_id(job_id: str):
    job = await job_repo.get_job_by_id(job_id)
    if job:
        job["id"] = str(job.pop("_id"))
    return job


async def update_job(job_id: str, job_data: dict):
    await job_repo.update_job(job_id, job_data)
