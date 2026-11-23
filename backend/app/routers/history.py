from fastapi import APIRouter, status
from app.schemas.calculator import HistoryRecord
from app.services import history_service

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history", response_model=list[HistoryRecord], status_code=status.HTTP_200_OK)
async def get_history() -> list[HistoryRecord]:
    return history_service.get_all()


@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
async def clear_history() -> None:
    history_service.clear_all()
