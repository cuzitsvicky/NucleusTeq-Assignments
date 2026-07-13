import pytest

from app import main
from app.main import health, root
from tests.conftest import async_return


@pytest.mark.asyncio
async def test_root_returns_api_metadata():
    assert await root() == {
        "message": "Interview Management Portal API",
        "version": "1.0.0",
    }


@pytest.mark.asyncio
async def test_health_returns_status():
    assert await health() == {"status": "healthy"}


@pytest.mark.asyncio
async def test_lifespan_connects_and_closes_mongo(monkeypatch):
    connect = async_return(None)
    close = async_return(None)
    monkeypatch.setattr(main, "connect_to_mongo", connect)
    monkeypatch.setattr(main, "close_mongo_connection", close)

    async with main.lifespan(main.app):
        connect.assert_awaited_once()
        close.assert_not_awaited()

    close.assert_awaited_once()
