import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_evaluate_endpoint_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/evaluate", json={"expression": "10 + 5 * 2", "angle_mode": "DEG", "precision": 10})
        assert res.status_code == 200
        data = res.json()
        assert data["result"] == "20"
        assert data["expression"] == "10 + 5 * 2"


@pytest.mark.asyncio
async def test_evaluate_endpoint_division_by_zero():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/evaluate", json={"expression": "1 / 0"})
        assert res.status_code == 422
        assert "Division by zero" in res.json()["detail"]


@pytest.mark.asyncio
async def test_history_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.delete("/api/history")
        await client.post("/api/evaluate", json={"expression": "7 * 3"})
        res = await client.get("/api/history")
        assert res.status_code == 200
        records = res.json()
        assert len(records) >= 1
        assert records[-1]["expression"] == "7 * 3"
        assert records[-1]["result"] == "21"


@pytest.mark.asyncio
async def test_modules_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/modules")
        assert res.status_code == 200
        assert len(res.json()) >= 4


@pytest.mark.asyncio
async def test_static_index_serving():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/")
        assert res.status_code == 200
        assert "Parf Gonodol" in res.text
