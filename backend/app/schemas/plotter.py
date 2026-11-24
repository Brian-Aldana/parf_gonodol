from pydantic import BaseModel, Field
from typing import Any, Literal


class PlotPointsRequest(BaseModel):
    expression: str
    x_min: float = -10.0
    x_max: float = 10.0
    samples: int = Field(default=400, ge=50, le=2000)


class Point2D(BaseModel):
    x: float
    y: float | None


class PlotPointsResponse(BaseModel):
    expression: str
    points: list[Point2D]
    x_min: float
    x_max: float


class SolveRootsRequest(BaseModel):
    expression: str
    method: Literal["bisection", "false_position", "newton_raphson", "secant"]
    xl: float | None = None
    xu: float | None = None
    x0: float | None = None
    x1: float | None = None
    manual_df: str | None = None
    tolerance: float = Field(default=0.01, gt=0, le=100)
    max_iter: int = Field(default=100, ge=1, le=1000)


class SolveRootsResponse(BaseModel):
    root: float
    iterations: int
    converged: bool
    final_error: float
    table: list[dict[str, Any]]
    derivative_used: str | None = None


class CalculusRequest(BaseModel):
    expression: str
    a: float = 0.0
    b: float = 1.0


class ExtremumPoint(BaseModel):
    x: float
    y: float
    kind: str


class CalculusResponse(BaseModel):
    derivative: str
    second_derivative: str
    definite_integral: float
    extrema: list[ExtremumPoint]
