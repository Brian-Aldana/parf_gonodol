export const KEYPAD_KEYS = [
  { id: "2nd", label: "2nd", type: "sci", action: "toggle-2nd" },
  { id: "deg", label: "deg", type: "sci", action: "toggle-angle" },
  { id: "sin", label: "sin", type: "sci", value: "sin(" },
  { id: "cos", label: "cos", type: "sci", value: "cos(" },
  { id: "tan", label: "tan", type: "sci", value: "tan(" },

  { id: "pow", label: "xʸ", type: "sci", value: "**" },
  { id: "sqr", label: "x²", type: "sci", value: "**2" },
  { id: "sqrt", label: "√", type: "sci", value: "sqrt(" },
  { id: "ln", label: "ln", type: "sci", value: "log(" },
  { id: "log", label: "log", type: "sci", value: "log10(" },

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
  function render() {
    container.innerHTML = "";
    KEYPAD_KEYS.forEach((k) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn btn--${k.type}`;
      btn.textContent = k.label;
      btn.dataset.id = k.id;
      if (k.value) btn.dataset.value = k.value;
      if (k.action) btn.dataset.action = k.action;
      container.appendChild(btn);
    });
  }

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const keyData = KEYPAD_KEYS.find((k) => k.id === btn.dataset.id);
    if (keyData && onKeyPress) onKeyPress(keyData);
  });

  render();
}
