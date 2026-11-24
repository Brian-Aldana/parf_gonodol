export const TEMPLATE_DEFINITIONS = [
  // Trigonometria
  { id: "sin", label: "sen", title: "Seno: sen(x)", template: "sen(□)" },
  { id: "cos", label: "cos", title: "Coseno: cos(x)", template: "cos(□)" },
  { id: "tan", label: "tan", title: "Tangente: tan(x)", template: "tan(□)" },
  { id: "asin", label: "sen⁻¹", title: "Arco seno: sen⁻¹(x)", template: "sen⁻¹(□)" },
  { id: "acos", label: "cos⁻¹", title: "Arco coseno: cos⁻¹(x)", template: "cos⁻¹(□)" },
  { id: "atan", label: "tan⁻¹", title: "Arco tangente: tan⁻¹(x)", template: "tan⁻¹(□)" },

  // Algebra y Potencias
  { id: "frac", label: "÷", title: "Fraccion: (a)/(b)", template: "(□) / (□)" },
  { id: "pow", label: "xⁿ", title: "Potencia: (x)^(n)", template: "(□)^(□)" },
  { id: "sqrt", label: "√x", title: "Raiz cuadrada", template: "sqrt(□)" },
  { id: "cbrt", label: "³√x", title: "Raiz cubica", template: "cbrt(□)" },
  { id: "nthroot", label: "ⁿ√x", title: "Raiz n-esima", template: "(□)^(1/(□))" },
  { id: "abs", label: "|x|", title: "Valor absoluto", template: "abs(□)" },

  // Calculo
  { id: "diff", label: "d/dx", title: "Primera derivada", template: "diff(□, x)" },
  { id: "diff2", label: "d²/dx²", title: "Segunda derivada", template: "diff(□, x, 2)" },
  { id: "int", label: "∫", title: "Integral indefinida", template: "integrate(□, x)" },
  { id: "defint", label: "∫ₐᵇ", title: "Integral definida en [a, b]", template: "integrate(□, (x, □, □))" },
  { id: "sum", label: "∑", title: "Sumatoria", template: "sum(□, (k, □, □))" },
  { id: "lim", label: "lim", title: "Limite", template: "limit(□, x, □)" },

  // Constantes y Logaritmos
  { id: "ln", label: "ln", title: "Logaritmo natural", template: "ln(□)" },
  { id: "log", label: "log", title: "Logaritmo base 10", template: "log(□)" },
  { id: "pi", label: "π", title: "Constante Pi", template: "pi" },
  { id: "e", label: "e", title: "Constante de Euler", template: "e" },
];

export function createMathTemplateToolbar({ onSelectTemplate }) {
  const container = document.createElement("div");
  container.className = "math-template-toolbar";

  TEMPLATE_DEFINITIONS.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "template-btn";
    btn.title = item.title;
    btn.dataset.templateId = item.id;
    btn.innerHTML = `<span class="template-label">${item.label}</span>`;

    btn.addEventListener("click", () => {
      if (typeof onSelectTemplate === "function") {
        onSelectTemplate(item);
      }
    });

    container.appendChild(btn);
  });

  return container;
}
