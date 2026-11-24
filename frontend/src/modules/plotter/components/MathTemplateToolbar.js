export const TEMPLATE_DEFINITIONS = [
  {
    id: "frac",
    label: "÷",
    subtext: "a/b",
    title: "Fracción (numerador / denominador)",
    template: "([ □ ]) / ([ □ ])",
  },
  {
    id: "pow",
    label: "□ⁿ",
    title: "Potencia (base ^ exponente)",
    template: "([ □ ])^([ □ ])",
  },
  {
    id: "sqrt",
    label: "√□",
    title: "Raíz cuadrada",
    template: "sqrt([ □ ])",
  },
  {
    id: "cbrt",
    label: "³√□",
    title: "Raíz cúbica",
    template: "cbrt([ □ ])",
  },
  {
    id: "nthroot",
    label: "ⁿ√□",
    title: "Raíz n-ésima",
    template: "([ □ ])^(1/([ □ ]))",
  },
  {
    id: "diff",
    label: "d/dx",
    title: "Primera derivada d/dx(f(x))",
    template: "diff([ □ ], x)",
  },
  {
    id: "diff2",
    label: "d²/dx²",
    title: "Segunda derivada d²/dx²(f(x))",
    template: "diff([ □ ], x, 2)",
  },
  {
    id: "int",
    label: "∫",
    title: "Integral indefinida ∫ f(x) dx",
    template: "integrate([ □ ], x)",
  },
  {
    id: "defint",
    label: "∫ₐᵇ",
    title: "Integral definida ∫ₐᵇ f(x) dx",
    template: "integrate([ □ ], (x, [ □ ], [ □ ]))",
  },
  {
    id: "sum",
    label: "∑",
    title: "Sumatoria ∑(expresión, k, min, max)",
    template: "sum([ □ ], (k, [ □ ], [ □ ]))",
  },
  {
    id: "lim",
    label: "lim",
    title: "Límite lim(f(x), x -> a)",
    template: "limit([ □ ], x, [ □ ])",
  },
  {
    id: "vec",
    label: "[□,□]",
    title: "Vector 2D",
    template: "[[ □ ], [ □ ]]",
  },
  {
    id: "mat",
    label: "[ ⊞ ]",
    title: "Matriz 2x2",
    template: "[[[ □ ], [ □ ]], [[ □ ], [ □ ]]]",
  },
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
