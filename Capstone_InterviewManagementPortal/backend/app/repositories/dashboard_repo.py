import logging
from ..core.database import db

logger = logging.getLogger(__name__)

"""
Count the number of jobs, candidates, and interviews in the database based on the provided query.
"""

async def count_jobs(query={}):
    logger.info("Counting jobs in database with query: %s", query)
    return await db.jobs.count_documents(query)


async def count_candidates(query={}):
    logger.info("Counting candidates in database with query: %s", query)
    return await db.candidates.count_documents(query)


async def count_interviews(query={}):
    logger.info("Counting interviews in database with query: %s", query)
    return await db.interviews.count_documents(query)
