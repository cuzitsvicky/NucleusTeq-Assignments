import pytest

from app.routers import dashboard
from tests.conftest import async_return


@pytest.mark.asyncio
async def test_get_dashboard_stats(monkeypatch, hr_user):
    get_stats = async_return({"role": "HR", "total_jobs": 2})
    monkeypatch.setattr(dashboard.dashboard_service, "get_stats", get_stats)

    result = await dashboard.get_dashboard_stats(hr_user)

    assert result == {"role": "HR", "total_jobs": 2}
    get_stats.assert_awaited_once_with("HR", "hr@nucleusteq.com")
