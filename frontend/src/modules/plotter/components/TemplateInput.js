export function createTemplateInput({ initialValue = "x^3 - 2*x - 5", onChange, onSubmit }) {
  const wrapper = document.createElement("div");
  wrapper.className = "template-input-wrapper";

  const prefix = document.createElement("span");
  prefix.className = "template-prefix";
  prefix.textContent = "f(x) =";

  const inputEl = document.createElement("input");
  inputEl.type = "text";
  inputEl.className = "template-input-field";
  inputEl.value = initialValue;
  inputEl.placeholder = "Ingrese f(x) o elija una plantilla arriba...";
  inputEl.spellcheck = false;
  inputEl.autocomplete = "off";

  wrapper.appendChild(prefix);
  wrapper.appendChild(inputEl);

  function _findNextBox(backwards = false) {
    const val = inputEl.value;
    const pos = inputEl.selectionStart;
    const target = "[ □ ]";

    if (!backwards) {
      const idx = val.indexOf(target, pos);
      return idx !== -1 ? idx : val.indexOf(target);
    }
    const idx = val.lastIndexOf(target, Math.max(0, pos - target.length));
    return idx !== -1 ? idx : val.lastIndexOf(target);
  }

  function focusNextBox(backwards = false) {
    const idx = _findNextBox(backwards);
    if (idx !== -1) {
      inputEl.focus();
      inputEl.setSelectionRange(idx + 2, idx + 3);
      return true;
    }
    return false;
  }

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const hasBox = focusNextBox(e.shiftKey);
      if (hasBox) {
        e.preventDefault();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (typeof onSubmit === "function") {
        onSubmit(getCleanExpression());
      }
    }
  });

  inputEl.addEventListener("input", () => {
    if (typeof onChange === "function") {
      onChange(getCleanExpression());
    }
  });

  function insertTemplate(templateItem) {
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    const val = inputEl.value;
    const tpl = templateItem.template;

    inputEl.value = val.slice(0, start) + tpl + val.slice(end);
    const firstBox = inputEl.value.indexOf("[ □ ]", start);
    if (firstBox !== -1) {
      inputEl.focus();
      inputEl.setSelectionRange(firstBox + 2, firstBox + 3);
    } else {
      inputEl.selectionStart = inputEl.selectionEnd = start + tpl.length;
    }

    if (typeof onChange === "function") {
      onChange(getCleanExpression());
    }
  }

  function getCleanExpression() {
    let raw = inputEl.value;
    raw = raw.replace(/\[\s*□\s*\]/g, "x");
    raw = raw.replace(/□/g, "x");
    return raw.trim();
  }

  function setValue(val) {
    inputEl.value = val;
    if (typeof onChange === "function") {
      onChange(getCleanExpression());
    }
  }

  return {
    element: wrapper,
    inputElement: inputEl,
    insertTemplate,
    getCleanExpression,
    getValue: () => inputEl.value,
    setValue,
    focus: () => inputEl.focus(),
  };
}
