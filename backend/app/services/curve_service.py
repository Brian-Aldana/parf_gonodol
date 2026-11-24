import math
from typing import Any
import sympy as sp
from app.services.root_finding import parse_function, RootFindingError


def generate_plot_points(
    expr_str: str, x_min: float, x_max: float, samples: int = 400
) -> list[dict[str, Any]]:
    if x_min >= x_max:
        raise RootFindingError("x_min debe ser estrictamente menor que x_max")

    _, f = parse_function(expr_str)
    points: list[dict[str, Any]] = []
    step = (x_max - x_min) / (samples - 1)

    for i in range(samples):
        x_val = x_min + i * step
        try:
            y_val = f(x_val)
            if isinstance(y_val, complex) or math.isnan(y_val) or math.isinf(y_val):
                points.append({"x": round(x_val, 6), "y": None})
            elif abs(y_val) > 1e6:
                points.append({"x": round(x_val, 6), "y": None})
            else:
                points.append({"x": round(x_val, 6), "y": round(float(y_val), 6)})
        except Exception:
            points.append({"x": round(x_val, 6), "y": None})

    return points


def _find_extrema_in_range(
    f_sym: sp.Expr, x_sym: sp.Symbol, a: float, b: float
) -> list[dict[str, Any]]:
    extrema = []
    low, high = min(a, b), max(a, b)
    df_sym = sp.diff(f_sym, x_sym)
    d2f_sym = sp.diff(df_sym, x_sym)

    try:
        critical_candidates = sp.solve(df_sym, x_sym)
        for cand in critical_candidates:
            if not cand.is_real:
                continue
            x_val = float(cand.evalf())
            if low <= x_val <= high:
                y_val = float(f_sym.subs(x_sym, cand).evalf())
                d2_val = float(d2f_sym.subs(x_sym, cand).evalf())
                kind = "maximo" if d2_val < 0 else ("minimo" if d2_val > 0 else "inflexion")
                extrema.append({"x": round(x_val, 4), "y": round(y_val, 4), "kind": kind})
    except Exception:
        pass

    return extrema


def analyze_calculus(expr_str: str, a: float, b: float) -> dict[str, Any]:
    f_sym, _ = parse_function(expr_str)
    x_sym = sp.Symbol("x")

    df_sym = sp.diff(f_sym, x_sym)
    d2f_sym = sp.diff(df_sym, x_sym)

    try:
        integral_val = float(sp.integrate(f_sym, (x_sym, a, b)).evalf())
    except Exception:
        integral_val = 0.0

    extrema = _find_extrema_in_range(f_sym, x_sym, a, b)

    return {
        "derivative": str(df_sym),
        "second_derivative": str(d2f_sym),
        "definite_integral": round(integral_val, 6),
        "extrema": extrema,
    }
