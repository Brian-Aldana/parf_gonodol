from dataclasses import dataclass
from typing import Callable, Any
import math
import sympy as sp
from app.services.math_engine import _preprocess_expression
from app.services.error_metrics import (
    ErrorType,
    compute_iteration_errors,
    is_converged,
)


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
    error_type: str = "absolute"
    final_ea: float | None = None
    final_er: float | None = None


def parse_function(expr_str: str) -> tuple[sp.Expr, Callable[[float], float]]:
    x = sp.Symbol("x")
    cleaned = expr_str.strip().replace("[", "(").replace("]", ")")
    cleaned = _preprocess_expression(cleaned)
    try:
        expr_sym = sp.sympify(
            cleaned,
            locals={
                "e": sp.E,
                "E": sp.E,
                "pi": sp.pi,
                "PI": sp.pi,
                "ln": sp.log,
                "log": sp.log,
                "cbrt": lambda a: a ** (sp.Rational(1, 3)),
            },
        )
    except Exception as exc:
        raise RootFindingError(f"Expresion matematica invalida: {exc}") from exc

    math_modules = [
        "math",
        {
            "e": math.e,
            "pi": math.pi,
            "log10": math.log10,
            "log2": math.log2,
            "math": math,
            "Abs": abs,
        },
    ]

    try:
        f_callable = sp.lambdify(x, expr_sym, modules=math_modules)
    except Exception as exc:
        raise RootFindingError(f"No fue posible compilar la funcion f(x): {exc}") from exc

    return expr_sym, f_callable


def _eval_safe(f: Callable[[float], float], val: float) -> float:
    try:
        res = f(val)
        if isinstance(res, complex):
            raise RootFindingError(f"Evaluacion en x={val} arrojo un valor complejo")
        num = float(res)
        if math.isnan(num) or math.isinf(num):
            raise RootFindingError(f"Evaluacion en x={val} no arrojo un numero real finito")
        return num
    except Exception as exc:
        raise RootFindingError(f"Error evaluando f({val}): {exc}") from exc


def solve_bisection(
    expr_str: str,
    xl: float,
    xu: float,
    tol: float = 0.001,
    max_iter: int = 100,
    error_type: ErrorType = "absolute",
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
    errs = compute_iteration_errors(xr, None)

    for k in range(max_iter):
        xr = (xl + xu) / 2.0
        fxr = _eval_safe(f, xr)
        errs = compute_iteration_errors(xr, xr_prev)

        table.append({
            "k": k,
            "xl": xl,
            "xu": xu,
            "xr": xr,
            "fxr": fxr,
            "ea": errs.ea if k > 0 else None,
            "er": errs.er if k > 0 else None,
            "ep": errs.ep if k > 0 else None,
        })

        if (k > 0 and is_converged(errs, tol, error_type)) or fxr == 0:
            final_err = getattr(errs, "ea" if error_type == "absolute" else ("er" if error_type == "relative" else "ep"))
            return RootFindingResult(xr, k + 1, True, final_err, table, error_type=error_type, final_ea=errs.ea, final_er=errs.er)

        if fl * fxr < 0:
            xu, fu = xr, fxr
        else:
            xl, fl = xr, fxr
        xr_prev = xr

    final_err = getattr(errs, "ea" if error_type == "absolute" else ("er" if error_type == "relative" else "ep"))
    return RootFindingResult(xr, max_iter, False, final_err, table, error_type=error_type, final_ea=errs.ea, final_er=errs.er)


def solve_false_position(
    expr_str: str,
    xl: float,
    xu: float,
    tol: float = 0.001,
    max_iter: int = 100,
    error_type: ErrorType = "absolute",
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
    errs = compute_iteration_errors(xr, None)

    for k in range(max_iter):
        denom = fl - fu
        if abs(denom) < 1e-14:
            raise RootFindingError("Division por cero en el calculo de Regla Falsa")

        xr = xu - (fu * (xl - xu)) / denom
        fxr = _eval_safe(f, xr)
        errs = compute_iteration_errors(xr, xr_prev)

        table.append({
            "k": k,
            "xl": xl,
            "xu": xu,
            "xr": xr,
            "fxr": fxr,
            "ea": errs.ea if k > 0 else None,
            "er": errs.er if k > 0 else None,
            "ep": errs.ep if k > 0 else None,
        })

        if (k > 0 and is_converged(errs, tol, error_type)) or fxr == 0:
            final_err = getattr(errs, "ea" if error_type == "absolute" else ("er" if error_type == "relative" else "ep"))
            return RootFindingResult(xr, k + 1, True, final_err, table, error_type=error_type, final_ea=errs.ea, final_er=errs.er)

        if fl * fxr < 0:
            xu, fu = xr, fxr
        else:
            xl, fl = xr, fxr
        xr_prev = xr

    final_err = getattr(errs, "ea" if error_type == "absolute" else ("er" if error_type == "relative" else "ep"))
    return RootFindingResult(xr, max_iter, False, final_err, table, error_type=error_type, final_ea=errs.ea, final_er=errs.er)


def solve_newton_raphson(
    expr_str: str,
    x0: float,
    manual_df_str: str | None = None,
    tol: float = 0.001,
    max_iter: int = 100,
    error_type: ErrorType = "absolute",
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
    xk = x0
    errs = compute_iteration_errors(xk, None)

    for k in range(max_iter):
        fxk = _eval_safe(f, xk)
        dfxk = _eval_safe(df, xk)

        if abs(dfxk) < 1e-12:
            raise RootFindingError(f"Derivada cercana a cero en iteracion {k} (x={xk:.6f})")

        x_next = xk - (fxk / dfxk)
        errs = compute_iteration_errors(x_next, xk)

        table.append({
            "k": k,
            "xk": xk,
            "fxk": fxk,
            "dfxk": dfxk,
            "x_next": x_next,
            "ea": errs.ea,
            "er": errs.er,
            "ep": errs.ep,
        })

        if is_converged(errs, tol, error_type) or fxk == 0:
            final_err = getattr(errs, "ea" if error_type == "absolute" else ("er" if error_type == "relative" else "ep"))
            return RootFindingResult(
                x_next, k + 1, True, final_err, table,
                derivative_used=df_str, error_type=error_type, final_ea=errs.ea, final_er=errs.er
            )

        xk = x_next

    final_err = getattr(errs, "ea" if error_type == "absolute" else ("er" if error_type == "relative" else "ep"))
    return RootFindingResult(
        xk, max_iter, False, final_err, table,
        derivative_used=df_str, error_type=error_type, final_ea=errs.ea, final_er=errs.er
    )


def solve_secant(
    expr_str: str,
    x0: float,
    x1: float,
    tol: float = 0.001,
    max_iter: int = 100,
    error_type: ErrorType = "absolute",
) -> RootFindingResult:
    _, f = parse_function(expr_str)
    table: list[dict[str, Any]] = []
    errs = compute_iteration_errors(x1, None)

    for k in range(max_iter):
        f0 = _eval_safe(f, x0)
        f1 = _eval_safe(f, x1)
        denom = f1 - f0

        if abs(denom) < 1e-14:
            raise RootFindingError(f"Denominador cercano a cero en iteracion {k}")

        x2 = x1 - (f1 * (x1 - x0)) / denom
        errs = compute_iteration_errors(x2, x1)

        table.append({
            "k": k,
            "x0": x0,
            "x1": x1,
            "x_next": x2,
            "fx2": _eval_safe(f, x2),
            "ea": errs.ea,
            "er": errs.er,
            "ep": errs.ep,
        })

        if is_converged(errs, tol, error_type):
            final_err = getattr(errs, "ea" if error_type == "absolute" else ("er" if error_type == "relative" else "ep"))
            return RootFindingResult(
                x2, k + 1, True, final_err, table,
                error_type=error_type, final_ea=errs.ea, final_er=errs.er
            )

        x0, x1 = x1, x2

    final_err = getattr(errs, "ea" if error_type == "absolute" else ("er" if error_type == "relative" else "ep"))
    return RootFindingResult(
        x1, max_iter, False, final_err, table,
        error_type=error_type, final_ea=errs.ea, final_er=errs.er
    )


def solve_fixed_point(
    gx_str: str,
    x0: float,
    tol: float = 0.001,
    max_iter: int = 100,
    error_type: ErrorType = "absolute",
) -> RootFindingResult:
    g_sym, g = parse_function(gx_str)
    x_sym = sp.Symbol("x")

    try:
        dg_sym = sp.diff(g_sym, x_sym)
        dg = sp.lambdify(x_sym, dg_sym, modules=["math"])
    except Exception:
        dg = None

    table: list[dict[str, Any]] = []
    xk = x0
    errs = compute_iteration_errors(xk, None)

    for k in range(max_iter):
        x_next = _eval_safe(g, xk)
        dgxk = abs(_eval_safe(dg, xk)) if dg else None
        errs = compute_iteration_errors(x_next, xk)

        table.append({
            "k": k,
            "xk": xk,
            "x_next": x_next,
            "dgxk": dgxk,
            "ea": errs.ea,
            "er": errs.er,
            "ep": errs.ep,
        })

        if is_converged(errs, tol, error_type):
            final_err = getattr(errs, "ea" if error_type == "absolute" else ("er" if error_type == "relative" else "ep"))
            return RootFindingResult(
                x_next, k + 1, True, final_err, table,
                error_type=error_type, final_ea=errs.ea, final_er=errs.er
            )

        xk = x_next

    final_err = getattr(errs, "ea" if error_type == "absolute" else ("er" if error_type == "relative" else "ep"))
    return RootFindingResult(
        xk, max_iter, False, final_err, table,
        error_type=error_type, final_ea=errs.ea, final_er=errs.er
    )
