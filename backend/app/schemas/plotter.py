from pydantic import BaseModel, Field
from typing import Any, Literal


class PlotPointsRequest(BaseModel):
    expression: str
    x_min: float = -10.0
    x_max: float = 10.0
    samples: int = Field(default=400, ge=2, le=2000)


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
    method: Literal["bisection", "false_position", "newton_raphson", "secant", "fixed_point"]
    xl: float | None = None
    xu: float | None = None
    x0: float | None = None
    x1: float | None = None
    gx: str | None = None
    manual_df: str | None = None
    error_type: Literal["absolute", "relative", "percentage"] = "absolute"
    tolerance: float = Field(default=0.001, gt=0, le=100)
    max_iter: int = Field(default=100, ge=1, le=1000)


class SolveRootsResponse(BaseModel):
    root: float
    iterations: int
    converged: bool
    final_error: float
    error_type: str = "absolute"
    final_ea: float | None = None
    final_er: float | None = None
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
