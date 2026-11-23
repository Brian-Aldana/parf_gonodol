export function createCalculatorState() {
  const state = {
    currentInput: "0",
    expression: "",
    angleMode: "DEG",
    isSecond: false,
    lastAns: "0",
    precision: 10,
    hasMemory: false,
    memoryVal: 0,
    isEvaluated: false
  };

  const listeners = new Set();

  function notify() {
    listeners.forEach((fn) => fn({ ...state }));
  }

  function subscribe(fn) {
    listeners.add(fn);
    fn({ ...state });
    return () => listeners.delete(fn);
  }

  function append(str) {
    if (state.isEvaluated) {
      if (!isNaN(str) || str === ".") {
        state.currentInput = str;
        state.expression = "";
      } else {
        state.currentInput += str;
      }
      state.isEvaluated = false;
    } else {
      if (state.currentInput === "0" && !isNaN(str)) {
        state.currentInput = str;
      } else {
        state.currentInput += str;
      }
    }
    notify();
  }

  function backspace() {
    if (state.isEvaluated) {
      clear();
      return;
    }
    if (state.currentInput.length > 1) {
      state.currentInput = state.currentInput.slice(0, -1);
    } else {
      state.currentInput = "0";
    }
    notify();
  }

  function clear() {
    state.currentInput = "0";
    state.expression = "";
    state.isEvaluated = false;
    notify();
  }

  function toggleAngle() {
    state.angleMode = state.angleMode === "DEG" ? "RAD" : "DEG";
    notify();
  }

  function toggleSecond() {
    state.isSecond = !state.isSecond;
    notify();
  }

  function negate() {
    if (state.currentInput.startsWith("-")) {
      state.currentInput = state.currentInput.slice(1);
    } else if (state.currentInput !== "0") {
      state.currentInput = "-" + state.currentInput;
    }
    notify();
  }

  function setPrecision(val) {
    state.precision = val;
    notify();
  }

  function applyAns() {
    append(state.lastAns);
  }

  function setEvaluated(result) {
    state.expression = state.currentInput;
    state.currentInput = result;
    state.lastAns = result;
    state.isEvaluated = true;
    notify();
  }

  function setError(message) {
    state.expression = state.currentInput;
    state.currentInput = message;
    state.isEvaluated = true;
    notify();
  }

  return {
    getState: () => ({ ...state }),
    subscribe,
    append,
    backspace,
    clear,
    toggleAngle,
    toggleSecond,
    negate,
    setPrecision,
    applyAns,
    setEvaluated,
    setError
  };
}
