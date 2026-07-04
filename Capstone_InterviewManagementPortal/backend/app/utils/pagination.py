from math import ceil
from typing import Any


def calculate_skip(page: int, limit: int) -> int:
    return (page - 1) * limit


def build_paginated_response(
    data: list[dict],
    page: int,
    limit: int,
    total: int,
) -> dict:
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
