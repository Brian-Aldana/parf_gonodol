from decimal import Decimal, getcontext, InvalidOperation
import ast
import math
import re
import sympy


ALLOWED_FUNCTIONS = {
    "sin", "cos", "tan",
    "asin", "acos", "atan", "atan2",
    "sinh", "cosh", "tanh",
    "sqrt", "log", "log10", "log2",
    "exp", "pow", "abs", "factorial",
    "ceil", "floor", "round",
}

ALLOWED_CONSTANTS = {
    "pi": math.pi,
    "e": math.e,
    "tau": math.tau,
    "inf": math.inf,
}


class UnsafeExpressionError(ValueError):
    pass


class MathEvaluationError(ValueError):
    pass


def _resolve_function(name: str, args: list, angle_mode: str) -> float:
    trig_funcs = {"sin", "cos", "tan", "asin", "acos", "atan"}

    if name in trig_funcs and angle_mode == "DEG":
        if name in {"sin", "cos", "tan"}:
            args = [math.radians(args[0])]
        elif name in {"asin", "acos", "atan"}:
            pass

    builtins_map = {"abs": abs, "round": round}
    func = getattr(math, name, None) or builtins_map.get(name)
    if func is None:
        raise UnsafeExpressionError(f"Function not allowed: {name}")

    result = func(*args)

    if name in {"asin", "acos", "atan"} and angle_mode == "DEG":
        result = math.degrees(result)

    return result


class SafeASTEvaluator(ast.NodeVisitor):
    def __init__(self, angle_mode: str = "DEG"):
        self.angle_mode = angle_mode

    def visit_Expression(self, node: ast.Expression) -> float:
        return self.visit(node.body)

    def visit_BinOp(self, node: ast.BinOp) -> float:
        left = self.visit(node.left)
        right = self.visit(node.right)
        ops = {
            ast.Add: lambda a, b: a + b,
            ast.Sub: lambda a, b: a - b,
            ast.Mult: lambda a, b: a * b,
            ast.Div: self._safe_div,
            ast.Pow: self._safe_pow,
            ast.Mod: lambda a, b: a % b,
        }
        op_type = type(node.op)
        if op_type not in ops:
            raise UnsafeExpressionError(f"Operator not allowed: {op_type.__name__}")
        return ops[op_type](left, right)

    def visit_UnaryOp(self, node: ast.UnaryOp) -> float:
        operand = self.visit(node.operand)
        if isinstance(node.op, ast.USub):
            return -operand
        if isinstance(node.op, ast.UAdd):
            return operand
        raise UnsafeExpressionError("Unary operator not allowed")

    def visit_Call(self, node: ast.Call) -> float:
        if not isinstance(node.func, ast.Name):
            raise UnsafeExpressionError("Only named function calls are allowed")
        name = node.func.id
        if name not in ALLOWED_FUNCTIONS:
            raise UnsafeExpressionError(f"Function not allowed: {name}")
        args = [self.visit(arg) for arg in node.args]
        return _resolve_function(name, args, self.angle_mode)

    def visit_Name(self, node: ast.Name) -> float:
        if node.id not in ALLOWED_CONSTANTS:
            raise UnsafeExpressionError(f"Name not allowed: {node.id}")
        return ALLOWED_CONSTANTS[node.id]

    def visit_Constant(self, node: ast.Constant) -> float:
        if not isinstance(node.value, (int, float)):
            raise UnsafeExpressionError("Only numeric constants allowed")
        return float(node.value)

    def generic_visit(self, node: ast.AST):
        raise UnsafeExpressionError(f"AST node not allowed: {type(node).__name__}")

    @staticmethod
    def _safe_div(a: float, b: float) -> float:
        if b == 0:
            raise MathEvaluationError("Division by zero")
        return a / b

    @staticmethod
    def _safe_pow(base: float, exp: float) -> float:
        if base == 0 and exp < 0:
            raise MathEvaluationError("Zero cannot be raised to a negative power")
        if base < 0 and not exp.is_integer():
            raise MathEvaluationError("Cannot raise negative number to a fractional power")
        return math.pow(base, exp)


def _preprocess_expression(expr: str) -> str:
    cleaned = expr.strip()
    cleaned = cleaned.replace("×", "*").replace("÷", "/").replace("−", "-").replace("^", "**")
    cleaned = cleaned.replace("sen⁻¹", "asin").replace("cos⁻¹", "acos").replace("tan⁻¹", "atan")
    cleaned = cleaned.replace("sin⁻¹", "asin").replace("cos⁻¹", "acos").replace("tan⁻¹", "atan")
    cleaned = re.sub(r"\barcsen\b", "asin", cleaned)
    cleaned = re.sub(r"\barccos\b", "acos", cleaned)
    cleaned = re.sub(r"\barctan\b", "atan", cleaned)
    cleaned = re.sub(r"\bsen\b", "sin", cleaned)
    cleaned = re.sub(r"(?<![\w.])(\d+(?:\.\d+)?)\s*\(", r"\1*(", cleaned)
    cleaned = re.sub(r"\)\s*\(", r")*(", cleaned)
    cleaned = re.sub(r"\)\s*(\d+)", r")*\1", cleaned)
    cleaned = re.sub(r"(?<![\w.])(\d+(?:\.\d+)?)\s*([a-zA-Z_]\w*)", r"\1*\2", cleaned)
    cleaned = re.sub(r"\)\s*([a-zA-Z_]\w*)", r")*\1", cleaned)
    return cleaned


def evaluate(expression: str, angle_mode: str = "DEG", precision: int = 10) -> str:
    getcontext().prec = precision + 4

    cleaned = _preprocess_expression(expression)
    if not cleaned:
        raise MathEvaluationError("Empty expression")

    try:
        tree = ast.parse(cleaned, mode="eval")
    except SyntaxError as exc:
        raise MathEvaluationError(f"Syntax error: {exc.msg}") from exc

    evaluator = SafeASTEvaluator(angle_mode=angle_mode)
    raw_result = evaluator.visit(tree)

    if not isinstance(raw_result, (int, float)):
        raise MathEvaluationError("Evaluation did not produce a numeric result")

    if math.isnan(raw_result):
        raise MathEvaluationError("Result is not a number")
    if math.isinf(raw_result):
        raise MathEvaluationError("Result is infinite")

    formatted = _format_result(raw_result, precision)
    return formatted


def _format_result(value: float, precision: int) -> str:
    try:
        d = Decimal(str(value)).normalize()
        rounded = round(d, precision)
        result_str = format(rounded, "f")

        if "." in result_str:
            result_str = result_str.rstrip("0").rstrip(".")

        return result_str
    except InvalidOperation:
        return str(value)
