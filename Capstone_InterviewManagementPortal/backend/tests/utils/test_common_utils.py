import pytest

from app.exceptions import BadRequestException, ForbiddenException
from app.utils import normalize_email, require_roles
from app.utils.pagination import build_paginated_response, calculate_skip, paginate_collection
from app.utils.security_utils import get_password_hash, verify_password
from app.validators.validators import validate_resume_extension


def test_calculate_skip():
    assert calculate_skip(page=3, limit=10) == 20


def test_normalize_email_strips_and_lowercases():
    assert normalize_email(" User@NucleusTeq.com ") == "user@nucleusteq.com"


def test_require_roles_allows_matching_role():
    assert require_roles({"role": "HR"}, {"Admin", "HR"}) is None


def test_require_roles_blocks_wrong_role():
    with pytest.raises(ForbiddenException) as exc:
        require_roles({"role": "Interviewer"}, {"Admin", "HR"})

    assert exc.value.detail == "Not authorized"


def test_build_paginated_response_flags():
    response = build_paginated_response([{"id": "1"}], page=2, limit=10, total=25)

    assert response == {
        "data": [{"id": "1"}],
        "page": 2,
        "limit": 10,
        "total": 25,
        "total_pages": 3,
        "has_next": True,
        "has_previous": True,
    }


@pytest.mark.asyncio
async def test_paginate_collection_applies_sort_skip_and_limit():
    from tests.conftest import FakeCollection

    collection = FakeCollection(find_data=[{"id": 1}, {"id": 2}], count=12)

    data, total = await paginate_collection(
        collection,
        {"active": True},
        page=2,
        limit=2,
        sort=("_id", -1),
    )

    assert data == [{"id": 1}, {"id": 2}]
    assert total == 12
    assert collection.count_calls == [{"active": True}]
    assert collection.find_calls == [{"active": True}]
    assert collection.cursor.calls == [("sort", ("_id", -1)), ("skip", 2), ("limit", 2)]


@pytest.mark.asyncio
async def test_paginate_collection_without_sort():
    from tests.conftest import FakeCollection

    collection = FakeCollection(find_data=[{"id": 1}], count=1)

    data, total = await paginate_collection(collection, {}, page=1, limit=5)

    assert data == [{"id": 1}]
    assert total == 1
    assert collection.cursor.calls == [("skip", 0), ("limit", 5)]


def test_password_hash_and_verify():
    hashed = get_password_hash("secret1")

    assert hashed != "secret1"
    assert verify_password("secret1", hashed) is True
    assert verify_password("wrong", hashed) is False


def test_validate_resume_extension_accepts_pdf():
    assert validate_resume_extension("resume.PDF") is None


def test_validate_resume_extension_rejects_non_pdf():
    with pytest.raises(BadRequestException) as exc:
        validate_resume_extension("resume.docx")

    assert "Resume must be a .PDF file" == exc.value.detail
