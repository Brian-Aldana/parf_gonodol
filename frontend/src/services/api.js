const DEFAULT_TIMEOUT_MS = 3500;

export async function evaluateRemote(expression, angleMode = "DEG", precision = 10) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let res;
  try {
    res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expression,
        angle_mode: angleMode,
        precision
      }),
      signal: controller.signal
    });
  } catch (netError) {
    clearTimeout(timer);
    if (netError.name === "AbortError") {
      throw new Error("Tiempo de espera agotado");
    }
    return evaluateFallback(expression);
  }

  clearTimeout(timer);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Error de sintaxis" }));
    throw new Error(err.detail || "Error en el servidor");
  }

  const data = await res.json();
  return { success: true, result: data.result };
}

export function evaluateFallback(expression) {
  try {
    const sanitized = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/\^/g, "**");

    const fn = new Function(`return (${sanitized})`);
    const val = fn();
    if (typeof val === "number" && !isNaN(val)) {
      return { success: true, result: String(val), fallback: true };
    }
    throw new Error("Error de sintaxis");
  } catch (err) {
    if (err.message === "Error de sintaxis") {
      throw err;
    }
    throw new Error("No se pudo conectar con el motor");
  }
}

export async function clearRemoteHistory() {
  try {
    await fetch("/api/history", { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}
