from dataclasses import dataclass
from typing import Literal

ErrorType = Literal["absolute", "relative", "percentage"]


@dataclass(frozen=True)
class IterationErrors:
    ea: float
    er: float
    ep: float


def compute_iteration_errors(
    current: float, previous: float | None
) -> IterationErrors:
    if previous is None:
        return IterationErrors(ea=0.0, er=0.0, ep=0.0)

    ea = abs(current - previous)
    denom = abs(current)
    er = ea / denom if denom > 1e-15 else ea
    ep = er * 100.0
    return IterationErrors(ea=ea, er=er, ep=ep)


def is_converged(
    errors: IterationErrors,
    tol: float,
    error_type: ErrorType = "absolute",
) -> bool:
    if error_type == "absolute":
        return errors.ea <= tol
    if error_type == "relative":
        return errors.er <= tol
    return errors.ep <= tol
