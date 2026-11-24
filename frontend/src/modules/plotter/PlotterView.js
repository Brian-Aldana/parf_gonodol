import { createMathTemplateToolbar } from "./components/MathTemplateToolbar.js";
import { createTemplateInput } from "./components/TemplateInput.js";
import { createCanvasPlotter } from "./components/CanvasPlotter.js";
import { createEquationSolverPanel } from "./components/EquationSolverPanel.js";
import { createCalculusPanel } from "./components/CalculusPanel.js";
import { createTableValuesPanel } from "./components/TableValuesPanel.js";

function createTopNav(onBack, onOpenMenu) {
  const nav = document.createElement("header");
  nav.className = "plotter-top-nav";

  nav.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px;">
      <button type="button" class="plotter-back-btn" id="btn-back-calc">
        &larr; Calculadora
      </button>
      <button type="button" class="plotter-menu-btn" id="btn-plotter-menu">
        Menu
      </button>
    </div>
    <span class="plotter-title">Graficador 2D y Resolucion de Ecuaciones</span>
    <div style="width: 140px;"></div>
  `;

  nav.querySelector("#btn-back-calc").addEventListener("click", onBack);
  nav.querySelector("#btn-plotter-menu").addEventListener("click", onOpenMenu);
  return nav;
}

function createSidebarTabs(panels) {
  const sidebar = document.createElement("aside");
  sidebar.className = "plotter-sidebar";

  const tabNav = document.createElement("div");
  tabNav.className = "sidebar-tab-nav";
  tabNav.innerHTML = `
    <button type="button" class="sidebar-tab-btn is-active" data-tab="solver">Resolucion</button>
    <button type="button" class="sidebar-tab-btn" data-tab="calc">Calculo 2D</button>
    <button type="button" class="sidebar-tab-btn" data-tab="table">Tabla</button>
  `;

  const contentArea = document.createElement("div");
  contentArea.className = "sidebar-tab-content";

  sidebar.appendChild(tabNav);
  sidebar.appendChild(contentArea);

  const tabMap = {
    solver: panels.solver.element,
    calc: panels.calc.element,
    table: panels.table.element,
  };

  function switchTab(name) {
    tabNav.querySelectorAll(".sidebar-tab-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.tab === name);
    });
    contentArea.innerHTML = "";
    if (tabMap[name]) {
      contentArea.appendChild(tabMap[name]);
    }
  }

  tabNav.querySelectorAll(".sidebar-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  switchTab("solver");
  return sidebar;
}

export function createPlotterView({ onBack, onOpenMenu }) {
  const container = document.createElement("div");
  container.className = "plotter-view-container";
  container.style.display = "none";

  const nav = createTopNav(onBack, onOpenMenu);
  container.appendChild(nav);

  const formulaBar = document.createElement("div");
  formulaBar.className = "plotter-formula-bar";

  const templateInput = createTemplateInput({
    initialValue: "x^3 - 2*x - 5",
    onSubmit: () => plotCurrentCurve(),
  });

  const toolbar = createMathTemplateToolbar({
    onSelectTemplate: (t) => templateInput.insertTemplate(t),
  });

  const btnPlot = document.createElement("button");
  btnPlot.type = "button";
  btnPlot.className = "btn-plot-curve";
  btnPlot.textContent = "Graficar Curva";
  btnPlot.addEventListener("click", () => plotCurrentCurve());

  formulaBar.appendChild(toolbar);
  formulaBar.appendChild(templateInput.element);
  formulaBar.appendChild(btnPlot);
  container.appendChild(formulaBar);

  const mainArea = document.createElement("div");
  mainArea.className = "plotter-main-content";

  const canvasArea = document.createElement("div");
  canvasArea.className = "plotter-canvas-area";

  const canvasPlotter = createCanvasPlotter({
    onViewportChange: () => plotCurrentCurve(),
  });
  canvasArea.appendChild(canvasPlotter.element);

  const solverPanel = createEquationSolverPanel({
    getExpression: () => templateInput.getCleanExpression(),
    onRootFound: (r) => canvasPlotter.setRootMarkers([r]),
  });

  const calculusPanel = createCalculusPanel({
    getExpression: () => templateInput.getCleanExpression(),
  });

  const tablePanel = createTableValuesPanel({
    getExpression: () => templateInput.getCleanExpression(),
  });

  const sidebar = createSidebarTabs({
    solver: solverPanel,
    calc: calculusPanel,
    table: tablePanel,
  });

  mainArea.appendChild(canvasArea);
  mainArea.appendChild(sidebar);
  container.appendChild(mainArea);

  async function plotCurrentCurve() {
    const expr = templateInput.getCleanExpression();
    if (!expr) return;
    const view = canvasPlotter.getViewport();
    try {
      const res = await fetch("/api/plot/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expression: expr,
          x_min: view.xMin,
          x_max: view.xMax,
          samples: 500,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      canvasPlotter.setPoints(data.points);
    } catch (err) {
      console.error("Error al graficar:", err);
    }
  }

  return {
    element: container,
    show: () => {
      container.style.display = "flex";
      plotCurrentCurve();
    },
    hide: () => {
      container.style.display = "none";
    },
  };
}
