from fastapi import APIRouter, status

router = APIRouter(prefix="/api", tags=["modules"])

REGISTERED_MODULES = [
    {"id": "unit-converter", "name": "Conversor de Unidades", "status": "planned"},
    {"id": "matrix-algebra", "name": "Algebra Matricial", "status": "planned"},
    {"id": "function-plotter", "name": "Graficador de Funciones 2D", "status": "planned"},
    {"id": "statistics", "name": "Estadistica Descriptiva", "status": "planned"},
]


@router.get("/modules", status_code=status.HTTP_200_OK)
async def list_modules() -> list[dict]:
    return REGISTERED_MODULES
