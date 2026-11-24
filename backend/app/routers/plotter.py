from fastapi import APIRouter, HTTPException, status
from app.schemas.plotter import (
    PlotPointsRequest,
    PlotPointsResponse,
    SolveRootsRequest,
    SolveRootsResponse,
    CalculusRequest,
    CalculusResponse,
)
from app.services import root_finding, curve_service

router = APIRouter(prefix="/api/plot", tags=["plotter"])


@router.post("/points", response_model=PlotPointsResponse)
async def get_plot_points(payload: PlotPointsRequest) -> PlotPointsResponse:
    try:
        pts = curve_service.generate_plot_points(
            payload.expression, payload.x_min, payload.x_max, payload.samples
        )
        return PlotPointsResponse(
            expression=payload.expression,
            points=pts,
            x_min=payload.x_min,
            x_max=payload.x_max,
        )
    except root_finding.RootFindingError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))


@router.post("/solve-roots", response_model=SolveRootsResponse)
async def solve_roots(payload: SolveRootsRequest) -> SolveRootsResponse:
    try:
        if payload.method == "bisection":
            if payload.xl is None or payload.xu is None:
                raise HTTPException(status_code=400, detail="Biseccion requiere xl y xu")
            res = root_finding.solve_bisection(
                payload.expression,
                payload.xl,
                payload.xu,
                payload.tolerance,
                payload.max_iter,
                payload.error_type,
            )
        elif payload.method == "false_position":
            if payload.xl is None or payload.xu is None:
                raise HTTPException(status_code=400, detail="Regla Falsa requiere xl y xu")
            res = root_finding.solve_false_position(
                payload.expression,
                payload.xl,
                payload.xu,
                payload.tolerance,
                payload.max_iter,
                payload.error_type,
            )
        elif payload.method == "newton_raphson":
            if payload.x0 is None:
                raise HTTPException(status_code=400, detail="Newton-Raphson requiere x0")
            res = root_finding.solve_newton_raphson(
                payload.expression,
                payload.x0,
                payload.manual_df,
                payload.tolerance,
                payload.max_iter,
                payload.error_type,
            )
        elif payload.method == "secant":
            if payload.x0 is None or payload.x1 is None:
                raise HTTPException(status_code=400, detail="Secante requiere x0 y x1")
            res = root_finding.solve_secant(
                payload.expression,
                payload.x0,
                payload.x1,
                payload.tolerance,
                payload.max_iter,
                payload.error_type,
            )
        elif payload.method == "fixed_point":
            if payload.x0 is None:
                raise HTTPException(status_code=400, detail="Punto Fijo requiere x0")
            gx_expr = payload.gx if (payload.gx and payload.gx.strip()) else payload.expression
            res = root_finding.solve_fixed_point(
                gx_expr,
                payload.x0,
                payload.tolerance,
                payload.max_iter,
                payload.error_type,
            )
        else:
            raise HTTPException(status_code=400, detail=f"Metodo no reconocido: {payload.method}")

        return SolveRootsResponse(
            root=res.root,
            iterations=res.iterations,
            converged=res.converged,
            final_error=res.final_error,
            error_type=res.error_type,
            final_ea=res.final_ea,
            final_er=res.final_er,
            table=res.table,
            derivative_used=res.derivative_used,
        )
    except root_finding.RootFindingError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))


@router.post("/calculus", response_model=CalculusResponse)
async def get_calculus_analysis(payload: CalculusRequest) -> CalculusResponse:
    try:
        data = curve_service.analyze_calculus(payload.expression, payload.a, payload.b)
        return CalculusResponse(**data)
    except root_finding.RootFindingError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
