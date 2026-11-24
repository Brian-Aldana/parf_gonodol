import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_plot_points_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post(
            "/api/plot/points",
            json={"expression": "x**2 - 4", "x_min": -3.0, "x_max": 3.0, "samples": 100},
        )
        assert res.status_code == 200
        data = res.json()
        assert len(data["points"]) == 100
        assert data["points"][0]["y"] is not None


@pytest.mark.asyncio
async def test_solve_roots_bisection_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post(
            "/api/plot/solve-roots",
            json={
                "expression": "x**3 - 2*x - 5",
                "method": "bisection",
                "xl": 2.0,
                "xu": 3.0,
                "tolerance": 0.01,
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["converged"] is True
        assert abs(data["root"] - 2.0945) < 0.005
        assert len(data["table"]) > 0


@pytest.mark.asyncio
async def test_solve_roots_newton_raphson_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post(
            "/api/plot/solve-roots",
            json={
                "expression": "x**3 - 2*x - 5",
                "method": "newton_raphson",
                "x0": 2.0,
                "tolerance": 0.01,
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["converged"] is True
        assert abs(data["root"] - 2.0945) < 0.001


@pytest.mark.asyncio
async def test_calculus_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post(
            "/api/plot/calculus",
            json={"expression": "x**3 - 3*x", "a": -2.0, "b": 2.0},
        )
        assert res.status_code == 200
        data = res.json()
        assert "3*x**2 - 3" in data["derivative"]
        assert len(data["extrema"]) > 0
