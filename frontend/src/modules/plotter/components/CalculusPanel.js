function formatMathExpression(expr) {
  if (!expr || expr === "-") return "-";
  let s = String(expr).trim();

  const supers = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻"
  };

  s = s.replace(/\*\*(-?\d+)/g, (_, p) => p.split("").map((c) => supers[c] || c).join(""));
  s = s.replace(/(\d+)\s*\*\s*([a-zA-Z])/g, "$1$2");
  s = s.replace(/(\d+)\s*\*\s*\(/g, "$1(");
  s = s.replace(/\)\s*\*\s*([a-zA-Z\(])/g, ")$1");
  s = s.replace(/\bsin\b/g, "sen");
  s = s.replace(/\s*([+\-])\s*/g, " $1 ");
  s = s.replace(/^\s*\+\s*/, "");
  return s.trim();
}

export function createCalculusPanel({ getExpression }) {
  const container = document.createElement("div");
  container.className = "calculus-panel-container";

  container.innerHTML = `
    <div class="form-row-inline">
      <div class="param-col">
        <label for="calc-a">Limite a:</label>
        <input type="number" id="calc-a" class="solver-input" value="-2.0" step="any">
      </div>
      <div class="param-col">
        <label for="calc-b">Limite b:</label>
        <input type="number" id="calc-b" class="solver-input" value="2.0" step="any">
      </div>
    </div>

    <button type="button" id="btn-run-calculus" class="btn-execute-solver">Calcular Analisis 2D</button>

    <div id="calculus-results" class="calculus-results-container is-hidden">
      <div class="calc-item-card">
        <span class="calc-item-label">Primera Derivada f'(x)</span>
        <div id="res-calc-df" class="calc-item-val">-</div>
      </div>
      <div class="calc-item-card">
        <span class="calc-item-label">Segunda Derivada f''(x)</span>
        <div id="res-calc-d2f" class="calc-item-val">-</div>
      </div>
      <div class="calc-item-card">
        <span class="calc-item-label">Integral Definida [a, b]</span>
        <div id="res-calc-int" class="calc-item-val">-</div>
      </div>
      <div class="calc-item-card">
        <span class="calc-item-label">Extremos Locales en [a, b]</span>
        <div id="res-calc-extrema" class="calc-item-val">-</div>
      </div>
    </div>
  `;

  const btnRun = container.querySelector("#btn-run-calculus");
  const resBox = container.querySelector("#calculus-results");
  const resDf = container.querySelector("#res-calc-df");
  const resD2f = container.querySelector("#res-calc-d2f");
  const resInt = container.querySelector("#res-calc-int");
  const resExtrema = container.querySelector("#res-calc-extrema");

  btnRun.addEventListener("click", async () => {
    const expr = getExpression();
    if (!expr) {
      alert("Ingrese una funcion f(x) valida.");
      return;
    }

    const a = parseFloat(container.querySelector("#calc-a").value) || 0.0;
    const b = parseFloat(container.querySelector("#calc-b").value) || 1.0;

    try {
      btnRun.disabled = true;
      btnRun.textContent = "Calculando...";
      const res = await fetch("/api/plot/calculus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: expr, a, b }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Error en analisis" }));
        throw new Error(err.detail || "Error en el servidor");
      }

      const data = await res.json();
      resBox.classList.remove("is-hidden");
      resDf.textContent = formatMathExpression(data.derivative);
      resD2f.textContent = formatMathExpression(data.second_derivative);
      resInt.textContent = data.definite_integral !== undefined
        ? Number(data.definite_integral.toFixed(6)).toString()
        : "-";

      if (data.extrema && data.extrema.length > 0) {
        resExtrema.innerHTML = data.extrema
          .map((e) => {
            const isMax = e.kind.toLowerCase().includes("max");
            const badgeClass = isMax ? "badge-max" : "badge-min";
            const label = isMax ? "Maximo" : "Minimo";
            return `
              <div class="extremum-row">
                <span class="extremum-tag ${badgeClass}">${label}</span>
                <span class="extremum-coords">(${e.x}, ${e.y})</span>
              </div>
            `;
          })
          .join("");
      } else {
        resExtrema.textContent = "Sin extremos relativos en el rango";
      }
    } catch (exc) {
      alert(`Error en calculo: ${exc.message}`);
    } finally {
      btnRun.disabled = false;
      btnRun.textContent = "Calcular Analisis 2D";
    }
  });

  return { element: container };
}
