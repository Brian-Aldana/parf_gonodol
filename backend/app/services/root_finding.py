from dataclasses import dataclass
from typing import Callable, Any
import math
import sympy as sp
from app.services.math_engine import _preprocess_expression


class RootFindingError(ValueError):
    pass


@dataclass
class RootFindingResult:
    root: float
    iterations: int
    converged: bool
    final_error: float
    table: list[dict[str, Any]]
    derivative_used: str | None = None


def parse_function(expr_str: str) -> tuple[sp.Expr, Callable[[float], float]]:
    x = sp.Symbol("x")
    cleaned = _preprocess_expression(expr_str)
    try:
        expr_sym = sp.sympify(cleaned)
    except Exception as exc:
        raise RootFindingError(f"Expresion matematica invalida: {exc}") from exc

    try:
        f_callable = sp.lambdify(x, expr_sym, modules=["math"])
    except Exception as exc:
        raise RootFindingError(f"No fue posible compilar la funcion f(x): {exc}") from exc

    return expr_sym, f_callable


def _eval_safe(f: Callable[[float], float], val: float) -> float:
    try:
        res = f(val)
        if isinstance(res, complex):
            raise RootFindingError(f"Evaluacion en x={val} arrojo un valor complejo")
        if math.isnan(res) or math.isinf(res):
            raise RootFindingError(f"Evaluacion en x={val} no arrojo un numero real finito")
        return float(res)
    except Exception as exc:
        raise RootFindingError(f"Error evaluando f({val}): {exc}") from exc


def _calc_rel_error(current: float, previous: float | None) -> float:
    if previous is None or current == 0:
        return 100.0
    return abs((current - previous) / current) * 100.0


def solve_bisection(
    expr_str: str, xl: float, xu: float, tol: float = 0.01, max_iter: int = 100
) -> RootFindingResult:
    _, f = parse_function(expr_str)
    fl, fu = _eval_safe(f, xl), _eval_safe(f, xu)

    if fl * fu > 0:
        raise RootFindingError(
            f"No hay cambio de signo en el intervalo [{xl}, {xu}]. f({xl})={fl:.4f}, f({xu})={fu:.4f}"
        )

    table: list[dict[str, Any]] = []
    xr_prev: float | None = None
    xr = xl

    for i in range(1, max_iter + 1):
        xr = (xl + xu) / 2.0
        fxr = _eval_safe(f, xr)
        ea = _calc_rel_error(xr, xr_prev)

        table.append({
            "iter": i,
            "xl": xl,
            "xu": xu,
            "xr": xr,
            "fxr": fxr,
            "ea": ea if i > 1 else None,
        })

        if ea <= tol or fxr == 0:
            return RootFindingResult(xr, i, True, ea if i > 1 else 0.0, table)

        if fl * fxr < 0:
            xu = xr
            fu = fxr
        else:
            xl = xr
            fl = fxr
        xr_prev = xr

    return RootFindingResult(xr, max_iter, False, ea, table)


def solve_false_position(
    expr_str: str, xl: float, xu: float, tol: float = 0.01, max_iter: int = 100
) -> RootFindingResult:
    _, f = parse_function(expr_str)
    fl, fu = _eval_safe(f, xl), _eval_safe(f, xu)

    if fl * fu > 0:
        raise RootFindingError(
            f"No hay cambio de signo en el intervalo [{xl}, {xu}]. f({xl})={fl:.4f}, f({xu})={fu:.4f}"
        )

    table: list[dict[str, Any]] = []
    xr_prev: float | None = None
    xr = xl

    for i in range(1, max_iter + 1):
        denom = fl - fu
        if abs(denom) < 1e-14:
            raise RootFindingError("Division por cero en el calculo de Regla Falsa")

        xr = xu - (fu * (xl - xu)) / denom
        fxr = _eval_safe(f, xr)
        ea = _calc_rel_error(xr, xr_prev)

        table.append({
            "iter": i,
            "xl": xl,
            "xu": xu,
            "xr": xr,
            "fxr": fxr,
            "ea": ea if i > 1 else None,
        })

        if ea <= tol or fxr == 0:
            return RootFindingResult(xr, i, True, ea if i > 1 else 0.0, table)

        if fl * fxr < 0:
            xu = xr
            fu = fxr
        else:
            xl = xr
            fl = fxr
        xr_prev = xr

    return RootFindingResult(xr, max_iter, False, ea, table)


def solve_newton_raphson(
    expr_str: str,
    x0: float,
    manual_df_str: str | None = None,
    tol: float = 0.01,
    max_iter: int = 100,
) -> RootFindingResult:
    f_sym, f = parse_function(expr_str)
    x_sym = sp.Symbol("x")

    if manual_df_str and manual_df_str.strip():
        _, df = parse_function(manual_df_str)
        df_str = manual_df_str.strip()
    else:
        df_sym = sp.diff(f_sym, x_sym)
        df_str = str(df_sym)
        df = sp.lambdify(x_sym, df_sym, modules=["math"])

    table: list[dict[str, Any]] = []
    xi = x0

    for i in range(1, max_iter + 1):
        fxi = _eval_safe(f, xi)
        dfxi = _eval_safe(df, xi)

        if abs(dfxi) < 1e-12:
            raise RootFindingError(f"Derivada cercana a cero en iteracion {i} (x={xi:.6f})")

        x_next = xi - (fxi / dfxi)
        ea = _calc_rel_error(x_next, xi)

        table.append({
            "iter": i,
            "xi": xi,
            "fxi": fxi,
            "dfxi": dfxi,
            "x_next": x_next,
            "ea": ea,
        })

        if ea <= tol or fxi == 0:
            return RootFindingResult(x_next, i, True, ea, table, derivative_used=df_str)

        xi = x_next

    return RootFindingResult(xi, max_iter, False, ea, table, derivative_used=df_str)


def solve_secant(
    expr_str: str, x0: float, x1: float, tol: float = 0.01, max_iter: int = 100
) -> RootFindingResult:
    _, f = parse_function(expr_str)
    table: list[dict[str, Any]] = []

    for i in range(1, max_iter + 1):
        f0 = _eval_safe(f, x0)
        f1 = _eval_safe(f, x1)
        denom = f1 - f0

        if abs(denom) < 1e-14:
            raise RootFindingError(f"Denominador cercano a cero en iteracion {i}")

        x2 = x1 - (f1 * (x1 - x0)) / denom
        ea = _calc_rel_error(x2, x1)

        table.append({
            "iter": i,
            "x0": x0,
            "x1": x1,
            "x2": x2,
            "fx2": _eval_safe(f, x2),
            "ea": ea,
        })

        if ea <= tol:
            return RootFindingResult(x2, i, True, ea, table)

        x0, x1 = x1, x2

    return RootFindingResult(x1, max_iter, False, ea, table)
