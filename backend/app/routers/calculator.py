from fastapi import APIRouter, HTTPException, status
from app.schemas.calculator import EvaluateRequest, EvaluateResponse
from app.services import math_engine, history_service

router = APIRouter(prefix="/api", tags=["calculator"])


@router.post("/evaluate", response_model=EvaluateResponse, status_code=status.HTTP_200_OK)
async def evaluate(payload: EvaluateRequest) -> EvaluateResponse:
    try:
        result = math_engine.evaluate(
            payload.expression,
            angle_mode=payload.angle_mode,
            precision=payload.precision,
        )
    except math_engine.MathEvaluationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except math_engine.UnsafeExpressionError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    history_service.add_record(payload.expression, result, payload.angle_mode)

    return EvaluateResponse(
        expression=payload.expression,
        result=result,
        angle_mode=payload.angle_mode,
    )
