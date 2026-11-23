export function Display(container, { onInput, onEnter, onEscape } = {}) {
  const expressionEl = container.querySelector(".display-expression");
  const inputEl = container.querySelector(".display-input");

  function setExpression(text) {
    expressionEl.textContent = text || "";
  }

  function setValue(text, isError = false, cursorPos = null) {
    inputEl.value = text;
    inputEl.classList.toggle("is-error", isError);

    if (cursorPos !== null && typeof cursorPos === "number") {
      const pos = Math.min(Math.max(0, cursorPos), text.length);
      inputEl.setSelectionRange(pos, pos);
    }
  }

  function getSelection() {
    return {
      start: inputEl.selectionStart ?? inputEl.value.length,
      end: inputEl.selectionEnd ?? inputEl.value.length
    };
  }

  function focus() {
    inputEl.focus();
  }

  inputEl.addEventListener("input", () => {
    if (onInput) {
      onInput(inputEl.value, inputEl.selectionStart);
    }
  });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onEnter) onEnter();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (onEscape) onEscape();
    }
  });

  return {
    setExpression,
    setValue,
    getSelection,
    focus
  };
}
