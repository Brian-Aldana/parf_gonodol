import { getModules } from "../modules/moduleRegistry.js";

export function MenuDrawer({
  drawerEl,
  overlayEl,
  openBtn,
  closeBtn,
  onPrecisionChange,
  onClearHistory,
  initialPrecision = 10
}) {
  const bodyEl = drawerEl.querySelector(".drawer-body");

  function open() {
    drawerEl.classList.add("is-open");
    overlayEl.classList.add("is-open");
    drawerEl.setAttribute("aria-hidden", "false");
  }

  function close() {
    drawerEl.classList.remove("is-open");
    overlayEl.classList.remove("is-open");
    drawerEl.setAttribute("aria-hidden", "true");
  }

  function render() {
    const modules = getModules();

    bodyEl.innerHTML = `
      <div class="drawer-section-label">Modulos y Herramientas</div>
      <div class="modules-list" style="display:flex; flex-direction:column; gap:8px;">
        ${modules
          .map(
            (m) => `
          <article class="module-card" data-module-id="${m.id}">
            <h4 class="module-card-title">${m.name}</h4>
            <p class="module-card-desc">${m.description}</p>
            <span class="module-card-badge">${m.status || "Disponible"}</span>
          </article>
        `
          )
          .join("")}
      </div>

      <div class="drawer-section-label" style="margin-top:14px;">Ajustes del Motor</div>
      <div class="settings-row">
        <label for="precision-select" class="settings-label">Precision decimal:</label>
        <select id="precision-select" class="settings-select">
          <option value="6" ${initialPrecision === 6 ? "selected" : ""}>6 digitos</option>
          <option value="10" ${initialPrecision === 10 ? "selected" : ""}>10 digitos</option>
          <option value="16" ${initialPrecision === 16 ? "selected" : ""}>16 digitos</option>
        </select>
      </div>

      <div class="settings-row">
        <label class="settings-label">Historial local:</label>
        <button id="btn-clear-history" type="button" class="btn--mode" style="height:24px; font-size:10px;">
          Vaciar historial
        </button>
      </div>
    `;

    bodyEl.querySelectorAll(".module-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.moduleId;
        const target = modules.find((m) => m.id === id);
        if (target && target.onSelect) target.onSelect();
      });
    });

    const precisionSelect = bodyEl.querySelector("#precision-select");
    if (precisionSelect && onPrecisionChange) {
      precisionSelect.addEventListener("change", (e) => {
        onPrecisionChange(Number(e.target.value));
      });
    }

    const clearHistoryBtn = bodyEl.querySelector("#btn-clear-history");
    if (clearHistoryBtn && onClearHistory) {
      clearHistoryBtn.addEventListener("click", onClearHistory);
    }
  }

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlayEl.addEventListener("click", close);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawerEl.classList.contains("is-open")) {
      close();
    }
  });

  render();

  return { open, close, refresh: render };
}
