export function createCalculatorState() {
  const state = {
    currentInput: "0",
    expression: "",
    cursorPos: 1,
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

  function insertAtCursor(str, start = state.cursorPos, end = state.cursorPos) {
    const s = Math.min(start, end);
    const e = Math.max(start, end);

    if (state.isEvaluated) {
      if (!isNaN(str) || str === ".") {
        state.currentInput = str;
        state.expression = "";
        state.cursorPos = str.length;
      } else {
        state.currentInput += str;
        state.cursorPos = state.currentInput.length;
      }
      state.isEvaluated = false;
      notify();
      return;
    }

    if (state.currentInput === "0" && s === 0 && e <= 1 && !isNaN(str)) {
      state.currentInput = str;
      state.cursorPos = str.length;
    } else {
      const before = state.currentInput.slice(0, s);
      const after = state.currentInput.slice(e);
      state.currentInput = before + str + after;
      state.cursorPos = s + str.length;
    }

    notify();
  }

  function deleteAtCursor(start = state.cursorPos, end = state.cursorPos) {
    if (state.isEvaluated) {
      clear();
      return;
    }

    const s = Math.min(start, end);
    const e = Math.max(start, end);

    if (s !== e) {
      state.currentInput = state.currentInput.slice(0, s) + state.currentInput.slice(e);
      state.cursorPos = s;
    } else if (s > 0) {
      state.currentInput = state.currentInput.slice(0, s - 1) + state.currentInput.slice(s);
      state.cursorPos = s - 1;
    }

    if (state.currentInput === "") {
      state.currentInput = "0";
      state.cursorPos = 1;
    }

    notify();
  }

  function setFromInput(val, pos) {
    state.currentInput = val || "0";
    state.cursorPos = pos ?? state.currentInput.length;
    state.isEvaluated = false;
    notify();
  }

  function clear() {
    state.currentInput = "0";
    state.expression = "";
    state.cursorPos = 1;
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
      state.cursorPos = Math.max(0, state.cursorPos - 1);
    } else if (state.currentInput !== "0") {
      state.currentInput = "-" + state.currentInput;
      state.cursorPos += 1;
    }
    notify();
  }

  function setPrecision(val) {
    state.precision = val;
    notify();
  }

  function applyAns(start = state.cursorPos, end = state.cursorPos) {
    insertAtCursor(state.lastAns, start, end);
  }

  function setEvaluated(result) {
    state.expression = state.currentInput;
    state.currentInput = result;
    state.lastAns = result;
    state.cursorPos = result.length;
    state.isEvaluated = true;
    notify();
  }

  function setError(message) {
    state.expression = state.currentInput;
    state.currentInput = message;
    state.cursorPos = message.length;
    state.isEvaluated = true;
    notify();
  }

  function memoryStore() {
    const val = parseFloat(state.currentInput);
    if (!isNaN(val)) {
      state.memoryVal = val;
      state.hasMemory = val !== 0;
      notify();
    }
  }

  function memoryRecall() {
    if (state.hasMemory) {
      insertAtCursor(String(state.memoryVal));
    }
  }

  function memoryAdd() {
    const val = parseFloat(state.currentInput);
    if (!isNaN(val)) {
      state.memoryVal += val;
      state.hasMemory = state.memoryVal !== 0;
      notify();
    }
  }

  function memorySubtract() {
    const val = parseFloat(state.currentInput);
    if (!isNaN(val)) {
      state.memoryVal -= val;
      state.hasMemory = state.memoryVal !== 0;
      notify();
    }
  }

  function memoryClear() {
    state.memoryVal = 0;
    state.hasMemory = false;
    notify();
  }

  return {
    getState: () => ({ ...state }),
    subscribe,
    insertAtCursor,
    deleteAtCursor,
    setFromInput,
    clear,
    toggleAngle,
    toggleSecond,
    negate,
    setPrecision,
    applyAns,
    setEvaluated,
    setError,
    memoryStore,
    memoryRecall,
    memoryAdd,
    memorySubtract,
    memoryClear
  };
}
