import { Display } from "./components/Display.js";
import { Keypad } from "./components/Keypad.js";
import { MenuDrawer } from "./components/MenuDrawer.js";
import { createCalculatorState } from "./services/state.js";
import { evaluateRemote, clearRemoteHistory } from "./services/api.js";
import { registerModule } from "./modules/moduleRegistry.js";
import { INITIAL_MODULES } from "./modules/placeholders.js";

INITIAL_MODULES.forEach((mod) => registerModule(mod));

const state = createCalculatorState();

const display = Display(document.querySelector(".display"));
const keypadContainer = document.querySelector(".keypad");

const badgeDeg = document.getElementById("badge-deg");
const badgeRad = document.getElementById("badge-rad");
const btnMem = document.getElementById("btn-mem");
const btn2nd = document.getElementById("btn-2nd");
const btnAngle = document.getElementById("btn-angle");
const btnReset = document.getElementById("btn-reset");
const memoryPopover = document.getElementById("memory-popover");
const memoryCurrentVal = document.getElementById("memory-current-val");

const keypad = Keypad(keypadContainer, handleKeyPress);

state.subscribe((s) => {
  display.setExpression(s.expression);
  display.setResult(s.currentInput, s.currentInput === "Error" || s.currentInput.startsWith("Error"));

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
btnReset.addEventListener("click", () => state.clear());

document.getElementById("btn-mc")?.addEventListener("click", () => state.memoryClear());
document.getElementById("btn-mr")?.addEventListener("click", () => state.memoryRecall());
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
}

function handleKeyPress(key) {
  if (key.action === "evaluate") {
    handleEvaluate();
  } else if (key.action === "del") {
    state.backspace();
  } else if (key.action === "ac") {
    state.clear();
  } else if (key.action === "toggle-angle") {
    state.toggleAngle();
  } else if (key.action === "toggle-2nd") {
    state.toggleSecond();
  } else if (key.action === "negate") {
    state.negate();
  } else if (key.action === "ans") {
    state.applyAns();
  } else if (key.value) {
    state.append(key.value);
  }
}

Keypad(keypadContainer, handleKeyPress);

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

window.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

  if (e.key >= "0" && e.key <= "9") {
    state.append(e.key);
  } else if (e.key === ".") {
    state.append(".");
  } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/" || e.key === "%") {
    state.append(e.key);
  } else if (e.key === "(" || e.key === ")") {
    state.append(e.key);
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    handleEvaluate();
  } else if (e.key === "Backspace") {
    state.backspace();
  } else if (e.key === "Escape") {
    state.clear();
  } else if (e.key.toLowerCase() === "m") {
    drawer.open();
  }
});
