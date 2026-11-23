export const KEYPAD_KEYS = [
  { id: "2nd", label: "2nd", type: "sci", action: "toggle-2nd" },
  { id: "deg", label: "deg", type: "sci", action: "toggle-angle" },
  { id: "sin", label: "sin", label2nd: "asin", type: "sci", value: "sin(", value2nd: "asin(" },
  { id: "cos", label: "cos", label2nd: "acos", type: "sci", value: "cos(", value2nd: "acos(" },
  { id: "tan", label: "tan", label2nd: "atan", type: "sci", value: "tan(", value2nd: "atan(" },

  { id: "pow", label: "xʸ", label2nd: "ʸ√x", type: "sci", value: "**", value2nd: "**(1/" },
  { id: "sqr", label: "x²", label2nd: "x³", type: "sci", value: "**2", value2nd: "**3" },
  { id: "sqrt", label: "√", label2nd: "∛", type: "sci", value: "sqrt(", value2nd: "pow(" },
  { id: "ln", label: "ln", label2nd: "eˣ", type: "sci", value: "log(", value2nd: "exp(" },
  { id: "log", label: "log", label2nd: "10ˣ", type: "sci", value: "log10(", value2nd: "10**" },

  { id: "lpar", label: "(", type: "sci", value: "(" },
  { id: "rpar", label: ")", type: "sci", value: ")" },
  { id: "pi", label: "π", type: "sci", value: "pi" },
  { id: "del", label: "DEL", type: "del", action: "del" },
  { id: "ac", label: "AC", type: "ac", action: "ac" },

  { id: "7", label: "7", type: "num", value: "7" },
  { id: "8", label: "8", type: "num", value: "8" },
  { id: "9", label: "9", type: "num", value: "9" },
  { id: "mod", label: "%", type: "op", value: "%" },
  { id: "div", label: "÷", type: "op", value: "/" },

  { id: "4", label: "4", type: "num", value: "4" },
  { id: "5", label: "5", type: "num", value: "5" },
  { id: "6", label: "6", type: "num", value: "6" },
  { id: "mul", label: "×", type: "op", value: "*" },
  { id: "sub", label: "−", type: "op", value: "-" },

  { id: "1", label: "1", type: "num", value: "1" },
  { id: "2", label: "2", type: "num", value: "2" },
  { id: "3", label: "3", type: "num", value: "3" },
  { id: "add", label: "+", type: "op", value: "+" },
  { id: "ans", label: "Ans", type: "sci", action: "ans" },

  { id: "pm", label: "±", type: "sci", action: "negate" },
  { id: "0", label: "0", type: "num", value: "0" },
  { id: "dot", label: ".", type: "num", value: "." },
  { id: "e", label: "e", type: "sci", value: "e" },
  { id: "eq", label: "=", type: "equal", action: "evaluate" }
];

export function Keypad(container, onKeyPress) {
  let isSecondMode = false;

  function render() {
    container.innerHTML = "";
    KEYPAD_KEYS.forEach((k) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn btn--${k.type}`;
      btn.textContent = isSecondMode && k.label2nd ? k.label2nd : k.label;
      btn.dataset.id = k.id;
      
      const val = isSecondMode && k.value2nd ? k.value2nd : k.value;
      if (val) btn.dataset.value = val;
      if (k.action) btn.dataset.action = k.action;
      container.appendChild(btn);
    });
  }

  function setSecondMode(active) {
    if (isSecondMode !== active) {
      isSecondMode = active;
      render();
    }
  }

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const keyData = KEYPAD_KEYS.find((k) => k.id === btn.dataset.id);
    if (!keyData) return;

    const val = isSecondMode && keyData.value2nd ? keyData.value2nd : keyData.value;
    if (onKeyPress) {
      onKeyPress({ ...keyData, resolvedValue: val });
    }
  });

  render();

  return { setSecondMode };
}
