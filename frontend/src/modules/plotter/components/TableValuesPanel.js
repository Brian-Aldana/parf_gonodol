export function createTableValuesPanel({ getExpression }) {
  const container = document.createElement("div");
  container.className = "table-values-panel-container";

  let lastTableData = [];

  container.innerHTML = `
    <div class="form-row-inline">
      <div class="param-col">
        <label for="tbl-start">x Inicio:</label>
        <input type="number" id="tbl-start" class="solver-input" value="-5.0" step="any">
      </div>
      <div class="param-col">
        <label for="tbl-end">x Fin:</label>
        <input type="number" id="tbl-end" class="solver-input" value="5.0" step="any">
      </div>
      <div class="param-col">
        <label for="tbl-step">Paso Δx:</label>
        <input type="number" id="tbl-step" class="solver-input" value="0.5" step="0.1" min="0.01">
      </div>
    </div>

    <button type="button" id="btn-gen-table" class="btn-execute-solver">Generar Tabla</button>

    <div id="table-output-box" class="table-output-container is-hidden">
      <div class="table-actions-bar">
        <span class="table-title">Valores f(x)</span>
        <button type="button" id="btn-copy-xy-csv" class="btn-copy-csv">Copiar CSV</button>
      </div>
      <div class="iteration-table-wrapper">
        <table class="iteration-table">
          <thead>
            <tr><th>x</th><th>f(x)</th></tr>
          </thead>
          <tbody id="xy-table-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const btnGen = container.querySelector("#btn-gen-table");
  const outputBox = container.querySelector("#table-output-box");
  const tbody = container.querySelector("#xy-table-tbody");
  const btnCopyCsv = container.querySelector("#btn-copy-xy-csv");

  btnGen.addEventListener("click", async () => {
    const expr = getExpression();
    if (!expr) {
      alert("Ingrese una funcion f(x) valida.");
      return;
    }

    const start = parseFloat(container.querySelector("#tbl-start").value) || -5.0;
    const end = parseFloat(container.querySelector("#tbl-end").value) || 5.0;
    const step = parseFloat(container.querySelector("#tbl-step").value) || 0.5;

    if (start >= end) {
      alert("x Inicio debe ser menor que x Fin.");
      return;
    }

    const samples = Math.min(Math.max(Math.round((end - start) / step) + 1, 2), 500);

    try {
      btnGen.disabled = true;
      btnGen.textContent = "Generando...";
      const res = await fetch("/api/plot/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: expr, x_min: start, x_max: end, samples }),
      });

      if (!res.ok) {
        throw new Error("No fue posible generar la tabla");
      }

      const data = await res.json();
      lastTableData = data.points || [];
      outputBox.classList.remove("is-hidden");
      tbody.innerHTML = lastTableData
        .map(
          (p) =>
            `<tr><td>${p.x}</td><td>${p.y !== null && p.y !== undefined ? p.y : "Indefinido"}</td></tr>`
        )
        .join("");
    } catch (exc) {
      alert(exc.message);
    } finally {
      btnGen.disabled = false;
      btnGen.textContent = "Generar Tabla";
    }
  });

  btnCopyCsv.addEventListener("click", () => {
    if (!lastTableData || lastTableData.length === 0) return;
    const csv = ["x,f(x)"].concat(lastTableData.map((p) => `${p.x},${p.y ?? ""}`)).join("\n");
    navigator.clipboard.writeText(csv);
    btnCopyCsv.textContent = "Copiado!";
    setTimeout(() => {
      btnCopyCsv.textContent = "Copiar CSV";
    }, 1500);
  });

  return { element: container };
}
