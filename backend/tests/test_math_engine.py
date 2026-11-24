import pytest
from app.services.math_engine import evaluate, MathEvaluationError, UnsafeExpressionError


class TestBasicArithmetic:
    def test_addition(self):
        assert evaluate("1 + 1") == "2"

    def test_subtraction(self):
        assert evaluate("10 - 3") == "7"

    def test_multiplication(self):
        assert evaluate("4 * 5") == "20"

    def test_division(self):
        assert evaluate("10 / 4") == "2.5"

    def test_power(self):
        assert evaluate("2 ** 3") == "8"

    def test_modulo(self):
        assert evaluate("10 % 3") == "1"

    def test_negative_number(self):
        assert evaluate("-5 + 2") == "-3"

    def test_operator_precedence(self):
        assert evaluate("2 + 3 * 4") == "14"

    def test_parentheses_override_precedence(self):
        assert evaluate("(2 + 3) * 4") == "20"


class TestScientificFunctions:
    def test_sqrt(self):
        assert evaluate("sqrt(9)") == "3"

    def test_sin_deg_30(self):
        result = evaluate("sin(30)", angle_mode="DEG")
        assert result == "0.5"

    def test_cos_deg_0(self):
        result = evaluate("cos(0)", angle_mode="DEG")
        assert result == "1"

    def test_sin_rad_pi_half(self):
        result = evaluate("sin(pi / 2)", angle_mode="RAD")
        assert result == "1"

    def test_log10(self):
        assert evaluate("log10(100)") == "2"

    def test_log_e(self):
        result = evaluate("log(e)")
        assert result == "1"

    def test_abs(self):
        assert evaluate("abs(-42)") == "42"

    def test_pi_constant(self):
        result = float(evaluate("pi"))
        assert abs(result - 3.14159265) < 1e-7

    def test_e_constant(self):
        result = float(evaluate("e"))
        assert abs(result - 2.71828182) < 1e-7


class TestEdgeCases:
    def test_division_by_zero_raises(self):
        with pytest.raises(MathEvaluationError, match="Division by zero"):
            evaluate("1 / 0")

    def test_empty_expression_raises(self):
        with pytest.raises(MathEvaluationError, match="Empty expression"):
            evaluate("   ")

    def test_invalid_syntax_raises(self):
        with pytest.raises(MathEvaluationError, match="Syntax error"):
            evaluate("2 */ 2")

    def test_negative_sqrt_raises(self):
        with pytest.raises((MathEvaluationError, ValueError)):
            evaluate("sqrt(-1)")

    def test_zero_to_negative_power_raises(self):
        with pytest.raises(MathEvaluationError):
            evaluate("0 ** -1")


class TestSecurityGuard:
    def test_import_blocked(self):
        with pytest.raises((MathEvaluationError, UnsafeExpressionError)):
            evaluate("__import__('os')")

    def test_builtin_access_blocked(self):
        with pytest.raises((MathEvaluationError, UnsafeExpressionError, SyntaxError)):
            evaluate("__builtins__")

    def test_string_literal_blocked(self):
        with pytest.raises((MathEvaluationError, UnsafeExpressionError)):
            evaluate("'hello'")

    def test_list_literal_blocked(self):
        with pytest.raises((MathEvaluationError, UnsafeExpressionError)):
            evaluate("[1, 2, 3]")

    def test_unknown_function_blocked(self):
        with pytest.raises(UnsafeExpressionError, match="Function not allowed"):
            evaluate("open('file.txt')")


class TestImplicitMultiplication:
    def test_number_before_parenthesis(self):
        assert evaluate("2(3)") == "6"

    def test_parentheses_multiplication(self):
        assert evaluate("(2)(3)") == "6"

    def test_number_before_trig_function(self):
        assert evaluate("2sin(30)", angle_mode="DEG") == "1"

    def test_zero_before_trig_function(self):
        assert evaluate("0sin(25)", angle_mode="DEG") == "0"
