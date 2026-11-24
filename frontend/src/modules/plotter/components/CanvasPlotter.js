export function createCanvasPlotter({ onViewportChange }) {
  const container = document.createElement("div");
  container.className = "canvas-plotter-container";

  const canvas = document.createElement("canvas");
  canvas.className = "plotter-canvas";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;

  const view = {
    xMin: -10,
    xMax: 10,
    yMin: -6,
    yMax: 6,
  };

  let points = [];
  let rootMarkers = [];
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };

  function toScreen(x, y) {
    const sx = ((x - view.xMin) / (view.xMax - view.xMin)) * width;
    const sy = height - ((y - view.yMin) / (view.yMax - view.yMin)) * height;
    return { x: sx, y: sy };
  }

  function toMath(sx, sy) {
    const mx = view.xMin + (sx / width) * (view.xMax - view.xMin);
    const my = view.yMin + ((height - sy) / height) * (view.yMax - view.yMin);
    return { x: mx, y: my };
  }

  function drawGrid() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;

    const xRange = view.xMax - view.xMin;
    const xStep = Math.pow(10, Math.floor(Math.log10(xRange))) / 2 || 1;

    for (let x = Math.floor(view.xMin / xStep) * xStep; x <= view.xMax; x += xStep) {
      const p = toScreen(x, 0);
      ctx.beginPath();
      ctx.moveTo(p.x, 0);
      ctx.lineTo(p.x, height);
      ctx.stroke();
    }

    const yRange = view.yMax - view.yMin;
    const yStep = Math.pow(10, Math.floor(Math.log10(yRange))) / 2 || 1;

    for (let y = Math.floor(view.yMin / yStep) * yStep; y <= view.yMax; y += yStep) {
      const p = toScreen(0, y);
      ctx.beginPath();
      ctx.moveTo(0, p.y);
      ctx.lineTo(width, p.y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    const origin = toScreen(0, 0);

    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, height);
    ctx.stroke();
  }

  function drawCurve() {
    if (!points || points.length < 2) return;
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      if (pt.y === null || isNaN(pt.y)) {
        started = false;
        continue;
      }
      const s = toScreen(pt.x, pt.y);
      if (!started) {
        ctx.moveTo(s.x, s.y);
        started = true;
      } else {
        ctx.lineTo(s.x, s.y);
      }
    }
    ctx.stroke();
  }

  function drawRoots() {
    rootMarkers.forEach((r) => {
      const p = toScreen(r, 0);
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f87171";
      ctx.font = "11px monospace";
      ctx.fillText(`x=${r.toFixed(4)}`, p.x + 8, p.y - 6);
    });
  }

  function render() {
    drawGrid();
    drawCurve();
    drawRoots();
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width || 600;
    height = rect.height || 400;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    render();
  }

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.85 : 1.15;
    const mouse = toMath(e.offsetX, e.offsetY);

    view.xMin = mouse.x + (view.xMin - mouse.x) * factor;
    view.xMax = mouse.x + (view.xMax - mouse.x) * factor;
    view.yMin = mouse.y + (view.yMin - mouse.y) * factor;
    view.yMax = mouse.y + (view.yMax - mouse.y) * factor;

    render();
    if (typeof onViewportChange === "function") {
      onViewportChange({ ...view });
    }
  });

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    dragStart = { x: e.clientX, y: e.clientY };

    const xSpan = ((view.xMax - view.xMin) / width) * dx;
    const ySpan = ((view.yMax - view.yMin) / height) * dy;

    view.xMin -= xSpan;
    view.xMax -= xSpan;
    view.yMin += ySpan;
    view.yMax += ySpan;

    render();
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      if (typeof onViewportChange === "function") {
        onViewportChange({ ...view });
      }
    }
  });

  const observer = new ResizeObserver(() => resize());
  observer.observe(container);

  return {
    element: container,
    setPoints: (newPoints) => {
      points = newPoints;
      render();
    },
    setRootMarkers: (roots) => {
      rootMarkers = roots;
      render();
    },
    resetView: () => {
      view.xMin = -10;
      view.xMax = 10;
      view.yMin = -6;
      view.yMax = 6;
      render();
      if (typeof onViewportChange === "function") onViewportChange({ ...view });
    },
    getViewport: () => ({ ...view }),
    redraw: render,
  };
}
