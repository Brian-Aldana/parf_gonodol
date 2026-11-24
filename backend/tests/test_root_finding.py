import pytest
from app.services.root_finding import (
    solve_bisection,
    solve_false_position,
    solve_newton_raphson,
    solve_secant,
    solve_fixed_point,
    RootFindingError,
)


class TestClosedMethods:
    def test_bisection_convergence(self):
        result = solve_bisection("x**3 - 2*x - 5", xl=2.0, xu=3.0, tol=0.001)
        assert result.converged is True
        assert abs(result.root - 2.09455) < 0.001
        assert result.final_error <= 0.001
        assert len(result.table) > 0
        assert "ea" in result.table[-1]

    def test_bisection_no_sign_change_raises(self):
        with pytest.raises(RootFindingError, match="No hay cambio de signo"):
            solve_bisection("x**2 + 1", xl=1.0, xu=2.0)

    def test_false_position_convergence(self):
        result = solve_false_position("x**3 - 2*x - 5", xl=2.0, xu=3.0, tol=0.001)
        assert result.converged is True
        assert abs(result.root - 2.09455) < 0.001
        assert result.final_error <= 0.001
        assert len(result.table) > 0


class TestOpenMethods:
    def test_newton_raphson_auto_derivative(self):
        result = solve_newton_raphson("x**3 - 2*x - 5", x0=2.0, tol=0.01)
        assert result.converged is True
        assert abs(result.root - 2.09455) < 0.0001
        assert result.final_error <= 0.01
        assert result.derivative_used is not None
        assert "3*x**2 - 2" in result.derivative_used

    def test_newton_raphson_manual_derivative(self):
        result = solve_newton_raphson(
            "x**3 - 2*x - 5", x0=2.0, manual_df_str="3*x**2 - 2", tol=0.01
        )
        assert result.converged is True
        assert abs(result.root - 2.09455) < 0.0001
        assert result.derivative_used == "3*x**2 - 2"

    def test_newton_raphson_workshop_problem_2_1(self):
        result = solve_newton_raphson(
            "x^4 - 2", x0=1.5, tol=1e-3, error_type="absolute"
        )
        assert result.converged is True
        assert result.iterations == 4
        assert abs(result.root - 1.189207) < 1e-5
        assert result.final_ea < 1e-3

    def test_newton_raphson_workshop_problem_3_2(self):
        result = solve_newton_raphson(
            "230*x^4 + 18*x^3 + 9*x^2 - 221*x - 9",
            x0=1.0,
            tol=1e-3,
            error_type="absolute",
        )
        assert result.converged is True
        assert result.iterations == 3
        assert abs(result.root - 0.962398) < 1e-5
        assert result.final_ea < 1e-3

    def test_fixed_point_workshop_problem_1_1(self):
        result = solve_fixed_point(
            "2*sin(sqrt(x))", x0=1.5, tol=1e-3, error_type="absolute"
        )
        assert result.converged is True
        assert result.iterations == 5
        assert abs(result.root - 1.972361) < 1e-4
        assert result.final_ea < 1e-3

    def test_newton_raphson_zero_derivative_raises(self):
        with pytest.raises(RootFindingError, match="Derivada cercana a cero"):
            solve_newton_raphson("x**3 - 3*x", x0=1.0)

    def test_secant_convergence(self):
        result = solve_secant("x**3 - 2*x - 5", x0=2.0, x1=3.0, tol=0.01)
        assert result.converged is True
        assert abs(result.root - 2.09455) < 0.001
        assert result.final_error <= 0.01
        assert len(result.table) > 0
