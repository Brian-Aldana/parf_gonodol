const DEFAULT_TIMEOUT_MS = 3500;

export async function evaluateRemote(expression, angleMode = "DEG", precision = 10) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expression,
        angle_mode: angleMode,
        precision
      }),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Error en calculo" }));
      throw new Error(err.detail || "Error en el servidor");
    }

    const data = await res.json();
    return { success: true, result: data.result };
  } catch (error) {
    clearTimeout(timer);
    if (error.name === "AbortError") {
      throw new Error("Tiempo de espera agotado");
    }
    return evaluateFallback(expression);
  }
}

export function evaluateFallback(expression) {
  try {
    const sanitized = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/\^/g, "**");

    // Evaluacion basica segura en local si el backend no responde
    const fn = new Function(`return (${sanitized})`);
    const val = fn();
    if (typeof val === "number" && !isNaN(val)) {
      return { success: true, result: String(val), fallback: true };
    }
    throw new Error("Sintaxis invalida");
  } catch {
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
