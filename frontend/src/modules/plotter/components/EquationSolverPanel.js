export function createEquationSolverPanel({ getExpression, onRootFound }) {
  const container = document.createElement("div");
  container.className = "solver-panel-container";

  let methodCategory = "closed";
  let selectedMethod = "bisection";
  let lastResultTable = [];

  container.innerHTML = `
    <div class="solver-category-switch">
      <button type="button" class="category-btn is-active" data-cat="closed">Metodos Cerrados</button>
      <button type="button" class="category-btn" data-cat="open">Metodos Abiertos</button>
    </div>

    <div class="solver-fields-group">
      <div class="form-row">
        <label for="solver-method-select">Metodo:</label>
        <select id="solver-method-select" class="solver-select">
          <option value="bisection">Biseccion</option>
          <option value="false_position">Regla Falsa</option>
        </select>
      </div>

      <div id="dynamic-params-container" class="dynamic-inputs-grid"></div>

      <div class="form-row-inline">
        <div class="param-col">
          <label for="param-tolerance">Tolerancia (%):</label>
          <input type="number" id="param-tolerance" class="solver-input" value="0.01" step="0.001" min="0.000001">
        </div>
        <div class="param-col">
          <label for="param-max-iter">Max Iter:</label>
          <input type="number" id="param-max-iter" class="solver-input" value="100" min="1" max="1000">
        </div>
      </div>

      <button type="button" id="btn-run-solver" class="btn-execute-solver">Calcular Raiz</button>
    </div>

    <div id="solver-result-box" class="solver-result-container is-hidden">
      <div class="result-summary-card">
        <div class="result-root-text" id="res-root-val">Raiz: x = -</div>
        <div class="result-meta-text" id="res-meta-val">Error: - | Iteraciones: -</div>
      </div>
      <div class="table-actions-bar">
        <span class="table-title">Iteraciones Paso a Paso</span>
        <button type="button" id="btn-copy-csv" class="btn-copy-csv">Copiar CSV</button>
      </div>
      <div class="iteration-table-wrapper">
        <table class="iteration-table" id="iteration-table-el">
          <thead id="iteration-thead"></thead>
          <tbody id="iteration-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const catBtns = container.querySelectorAll(".category-btn");
  const methodSelect = container.querySelector("#solver-method-select");
  const paramsContainer = container.querySelector("#dynamic-params-container");
  const btnRun = container.querySelector("#btn-run-solver");
  const resultBox = container.querySelector("#solver-result-box");
  const resRootVal = container.querySelector("#res-root-val");
  const resMetaVal = container.querySelector("#res-meta-val");
  const tableHead = container.querySelector("#iteration-thead");
  const tableBody = container.querySelector("#iteration-tbody");
  const btnCopyCsv = container.querySelector("#btn-copy-csv");

  function renderDynamicInputs() {
    if (methodCategory === "closed") {
      methodSelect.innerHTML = `
        <option value="bisection" ${selectedMethod === "bisection" ? "selected" : ""}>Biseccion</option>
        <option value="false_position" ${selectedMethod === "false_position" ? "selected" : ""}>Regla Falsa</option>
      `;
      paramsContainer.innerHTML = `
        <div class="param-col">
          <label for="param-xl">Limite Inferior (xl):</label>
          <input type="number" id="param-xl" class="solver-input" value="2.0" step="any">
        </div>
        <div class="param-col">
          <label for="param-xu">Limite Superior (xu):</label>
          <input type="number" id="param-xu" class="solver-input" value="3.0" step="any">
        </div>
      `;
    } else {
      methodSelect.innerHTML = `
        <option value="newton_raphson" ${selectedMethod === "newton_raphson" ? "selected" : ""}>Newton-Raphson</option>
        <option value="secant" ${selectedMethod === "secant" ? "selected" : ""}>Secante</option>
      `;
      if (selectedMethod === "newton_raphson") {
        paramsContainer.innerHTML = `
          <div class="param-col">
            <label for="param-x0">Valor Inicial (x0):</label>
            <input type="number" id="param-x0" class="solver-input" value="2.0" step="any">
          </div>
          <div class="param-col">
            <label for="param-manual-df">Derivada f'(x) (opcional):</label>
            <input type="text" id="param-manual-df" class="solver-input" placeholder="Automatica con SymPy">
          </div>
        `;
      } else {
        paramsContainer.innerHTML = `
          <div class="param-col">
            <label for="param-x0">Punto 1 (x0):</label>
            <input type="number" id="param-x0" class="solver-input" value="2.0" step="any">
          </div>
          <div class="param-col">
            <label for="param-x1">Punto 2 (x1):</label>
            <input type="number" id="param-x1" class="solver-input" value="3.0" step="any">
          </div>
        `;
      }
    }
  }

  catBtns.forEach((b) => {
    b.addEventListener("click", () => {
      catBtns.forEach((btn) => btn.classList.remove("is-active"));
      b.classList.add("is-active");
      methodCategory = b.dataset.cat;
      selectedMethod = methodCategory === "closed" ? "bisection" : "newton_raphson";
      renderDynamicInputs();
    });
  });

  methodSelect.addEventListener("change", (e) => {
    selectedMethod = e.target.value;
    renderDynamicInputs();
  });

  function renderTable(table) {
    lastResultTable = table;
    if (!table || table.length === 0) return;
    const keys = Object.keys(table[0]);
    tableHead.innerHTML = `<tr>${keys.map((k) => `<th>${k}</th>`).join("")}</tr>`;
    tableBody.innerHTML = table
      .map(
        (row) =>
          `<tr>${keys
            .map((k) => {
              const val = row[k];
              if (val === null || val === undefined) return "-";
              return typeof val === "number" ? val.toFixed(6) : val;
            })
            .map((v) => `<td>${v}</td>`)
            .join("")}</tr>`
      )
      .join("");
  }

  btnRun.addEventListener("click", async () => {
    const expr = getExpression();
    if (!expr) {
      alert("Ingrese una funcion f(x) valida primero.");
      return;
    }

    const tol = parseFloat(container.querySelector("#param-tolerance").value) || 0.01;
    const maxIter = parseInt(container.querySelector("#param-max-iter").value, 10) || 100;
    const payload = { expression: expr, method: selectedMethod, tolerance: tol, max_iter: maxIter };

    if (methodCategory === "closed") {
      payload.xl = parseFloat(container.querySelector("#param-xl").value);
      payload.xu = parseFloat(container.querySelector("#param-xu").value);
    } else if (selectedMethod === "newton_raphson") {
      payload.x0 = parseFloat(container.querySelector("#param-x0").value);
      const mdf = container.querySelector("#param-manual-df").value.trim();
      if (mdf) payload.manual_df = mdf;
    } else {
      payload.x0 = parseFloat(container.querySelector("#param-x0").value);
      payload.x1 = parseFloat(container.querySelector("#param-x1").value);
    }

    try {
      btnRun.disabled = true;
      btnRun.textContent = "Calculando...";
      const res = await fetch("/api/plot/solve-roots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Error en calculo" }));
        throw new Error(err.detail || "Error en el servidor");
      }

      const data = await res.json();
      resultBox.classList.remove("is-hidden");
      resRootVal.textContent = `Raiz: x = ${data.root.toFixed(6)}`;
      resMetaVal.textContent = `Error final: ${data.final_error.toFixed(4)}% | Iteraciones: ${data.iterations}`;
      renderTable(data.table);

      if (typeof onRootFound === "function") {
        onRootFound(data.root);
      }
    } catch (exc) {
      alert(`Error al calcular raiz: ${exc.message}`);
    } finally {
      btnRun.disabled = false;
      btnRun.textContent = "Calcular Raiz";
    }
  });

  btnCopyCsv.addEventListener("click", () => {
    if (!lastResultTable || lastResultTable.length === 0) return;
    const keys = Object.keys(lastResultTable[0]);
    const csvRows = [keys.join(",")];
    lastResultTable.forEach((row) => {
      csvRows.push(keys.map((k) => row[k] ?? "").join(","));
    });
    navigator.clipboard.writeText(csvRows.join("\n"));
    btnCopyCsv.textContent = "Copiado!";
    setTimeout(() => {
      btnCopyCsv.textContent = "Copiar CSV";
    }, 1500);
  });

  renderDynamicInputs();
  return { element: container };
}
