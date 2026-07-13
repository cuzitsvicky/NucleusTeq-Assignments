from math import ceil
from typing import Any


# Utility functions for pagination in MongoDB collections.
def calculate_skip(page: int, limit: int) -> int:
    return (page - 1) * limit

# Build a paginated response dictionary based on the provided data, page, limit, and total count.
def build_paginated_response(data: list[dict], page: int, limit: int, total: int) -> dict:

    total_pages = ceil(total / limit)

    return {
        "data": data,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1,
    }

# Paginate a MongoDB collection based on the provided query, page, limit, and optional sorting.
async def paginate_collection(
    collection: Any,
    query: dict,
    page: int,
    limit: int,
    sort: tuple[str, int] | None = None,
) -> tuple[list[dict], int]:
    
    skip = calculate_skip(page, limit)
    total = await collection.count_documents(query)
    cursor = collection.find(query)

    if sort:
        cursor = cursor.sort(*sort)

    data = await cursor.skip(skip).limit(limit).to_list(length=limit)

    return data, total
