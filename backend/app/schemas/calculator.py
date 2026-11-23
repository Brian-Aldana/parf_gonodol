from pydantic import BaseModel, Field
from typing import Literal, Optional


class EvaluateRequest(BaseModel):
    expression: str = Field(..., min_length=1, max_length=512)
    angle_mode: Literal["DEG", "RAD"] = "DEG"
    precision: int = Field(default=10, ge=1, le=50)


class EvaluateResponse(BaseModel):
    expression: str
    result: str
    angle_mode: str


class HistoryRecord(BaseModel):
    id: int
    expression: str
    result: str
    angle_mode: str
    timestamp: str


class ErrorResponse(BaseModel):
    detail: str
