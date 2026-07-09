from ..core.database import db


async def count_jobs(query={}):
    return await db.jobs.count_documents(query)


async def count_candidates(query={}):
    return await db.candidates.count_documents(query)


async def count_interviews(query={}):
    return await db.interviews.count_documents(query)
