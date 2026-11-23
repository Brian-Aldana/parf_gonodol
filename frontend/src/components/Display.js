export function Display(container) {
  const expressionEl = container.querySelector(".display-expression");
  const resultEl = container.querySelector(".display-result");

  function setExpression(text) {
    expressionEl.textContent = text || "";
  }

  function setResult(text, isError = false) {
    resultEl.textContent = text;
    resultEl.classList.toggle("is-error", isError);
  }

  function clear() {
    setExpression("");
    setResult("0");
  }

  return { setExpression, setResult, clear };
}
