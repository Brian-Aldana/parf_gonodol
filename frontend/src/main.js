import { Display } from "./components/Display.js";
import { Keypad } from "./components/Keypad.js";
import { MenuDrawer } from "./components/MenuDrawer.js";
import { createCalculatorState } from "./services/state.js";
import { evaluateRemote, clearRemoteHistory } from "./services/api.js";
import { registerModule } from "./modules/moduleRegistry.js";
import { INITIAL_MODULES } from "./modules/placeholders.js";

INITIAL_MODULES.forEach((mod) => registerModule(mod));

const state = createCalculatorState();

const keypadContainer = document.querySelector(".keypad");
const badgeDeg = document.getElementById("badge-deg");
const badgeRad = document.getElementById("badge-rad");
const btnMem = document.getElementById("btn-mem");
const btn2nd = document.getElementById("btn-2nd");
const btnAngle = document.getElementById("btn-angle");
const btnReset = document.getElementById("btn-reset");
const memoryPopover = document.getElementById("memory-popover");
const memoryCurrentVal = document.getElementById("memory-current-val");

const display = Display(document.querySelector(".display"), {
  onInput: (val, pos) => state.setFromInput(val, pos),
  onEnter: () => handleEvaluate(),
  onEscape: () => state.clear()
});

const keypad = Keypad(keypadContainer, handleKeyPress);

// Evita que el campo de texto pierda foco al hacer clic en los botones
keypadContainer.addEventListener("mousedown", (e) => {
  if (e.target.closest("button")) {
    e.preventDefault();
  }
});

state.subscribe((s) => {
  display.setExpression(s.expression);
  display.setValue(
    s.currentInput,
    s.currentInput === "Error" || s.currentInput.startsWith("Error"),
    s.cursorPos
  );

  const isDeg = s.angleMode === "DEG";
  badgeDeg.classList.toggle("is-active", isDeg);
  badgeRad.classList.toggle("is-active", !isDeg);
  btn2nd.classList.toggle("is-active", s.isSecond);
  btnMem.classList.toggle("is-active", s.hasMemory);

  if (memoryCurrentVal) {
    memoryCurrentVal.textContent = String(s.memoryVal);
  }

  keypad.setSecondMode(s.isSecond);
});

btnMem.addEventListener("click", (e) => {
  e.stopPropagation();
  memoryPopover.classList.toggle("is-open");
});

document.addEventListener("click", (e) => {
  if (!memoryPopover.contains(e.target) && e.target !== btnMem) {
    memoryPopover.classList.remove("is-open");
  }
});

btn2nd.addEventListener("click", () => state.toggleSecond());
btnAngle.addEventListener("click", () => state.toggleAngle());
btnReset.addEventListener("click", () => {
  state.clear();
  display.focus();
});

document.getElementById("btn-mc")?.addEventListener("click", () => state.memoryClear());
document.getElementById("btn-mr")?.addEventListener("click", () => {
  const sel = display.getSelection();
  state.memoryRecall(sel.start, sel.end);
  display.focus();
});
document.getElementById("btn-m-plus")?.addEventListener("click", () => state.memoryAdd());
document.getElementById("btn-m-minus")?.addEventListener("click", () => state.memorySubtract());
document.getElementById("btn-ms")?.addEventListener("click", () => state.memoryStore());

async function handleEvaluate() {
  const s = state.getState();
  if (!s.currentInput || s.currentInput === "0") return;

  try {
    const res = await evaluateRemote(s.currentInput, s.angleMode, s.precision);
    if (res.success) {
      state.setEvaluated(res.result);
    }
  } catch (err) {
    state.setError(err.message || "Error");
  }
  display.focus();
}

function handleKeyPress(key) {
  const sel = display.getSelection();

  if (key.action === "evaluate") {
    handleEvaluate();
  } else if (key.action === "del") {
    state.deleteAtCursor(sel.start, sel.end);
  } else if (key.action === "ac") {
    state.clear();
  } else if (key.action === "toggle-angle") {
    state.toggleAngle();
  } else if (key.action === "toggle-2nd") {
    state.toggleSecond();
  } else if (key.action === "negate") {
    state.negate();
  } else if (key.action === "ans") {
    state.applyAns(sel.start, sel.end);
  } else if (key.resolvedValue) {
    state.insertAtCursor(key.resolvedValue, sel.start, sel.end);
  }

  display.focus();
}

const drawer = MenuDrawer({
  drawerEl: document.getElementById("drawer"),
  overlayEl: document.getElementById("drawer-overlay"),
  openBtn: document.getElementById("btn-menu"),
  closeBtn: document.getElementById("btn-close-drawer"),
  initialPrecision: state.getState().precision,
  onPrecisionChange: (val) => state.setPrecision(val),
  onClearHistory: async () => {
    const ok = await clearRemoteHistory();
    alert(ok ? "Historial vaciado correctamente." : "No se pudo vaciar el historial.");
  }
});

// Atajo global para abrir menu con 'm' si no se esta editando texto
window.addEventListener("keydown", (e) => {
  if (e.target.tagName !== "INPUT" && e.key.toLowerCase() === "m") {
    drawer.open();
  }
});

display.focus();
