function createControls(onZoomIn, onZoomOut, onReset) {
  const controls = document.createElement("div");
  controls.className = "plotter-canvas-controls";
  controls.innerHTML = `
    <button type="button" class="canvas-ctrl-btn" id="ctrl-zoom-in" title="Acercar">+</button>
    <button type="button" class="canvas-ctrl-btn" id="ctrl-zoom-out" title="Alejar">&minus;</button>
    <button type="button" class="canvas-ctrl-btn" id="ctrl-reset" title="Restablecer vista">&#x21ba;</button>
  `;
  controls.querySelector("#ctrl-zoom-in").addEventListener("click", onZoomIn);
  controls.querySelector("#ctrl-zoom-out").addEventListener("click", onZoomOut);
  controls.querySelector("#ctrl-reset").addEventListener("click", onReset);
  return controls;
}

export function createCanvasPlotter({ onViewportChange }) {
  const container = document.createElement("div");
  container.className = "canvas-plotter-container";

  const canvas = document.createElement("canvas");
  canvas.className = "plotter-canvas";
  container.appendChild(canvas);

  const coordBadge = document.createElement("div");
  coordBadge.className = "canvas-coord-badge";
  coordBadge.textContent = "x: 0.00, y: 0.00";
  container.appendChild(coordBadge);

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;

  const view = { xMin: -10, xMax: 10, yMin: -6, yMax: 6 };
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
    const mx = view.xMin + (sx / (width || 1)) * (view.xMax - view.xMin);
    const my = view.yMin + ((height - sy) / (height || 1)) * (view.yMax - view.yMin);
    return { x: mx, y: my };
  }

  function drawGridLines(origin) {
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#64748b";
    ctx.font = "10px monospace";

    const xRange = Math.max(view.xMax - view.xMin, 1e-6);
    const xStep = Math.pow(10, Math.floor(Math.log10(xRange))) / 2 || 1;
    const axisY = Math.min(Math.max(origin.y, 14), height - 16);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let x = Math.floor(view.xMin / xStep) * xStep; x <= view.xMax; x += xStep) {
      const p = toScreen(x, 0);
      ctx.beginPath();
      ctx.moveTo(p.x, 0);
      ctx.lineTo(p.x, height);
      ctx.stroke();
      if (Math.abs(x) > 1e-6) {
        ctx.fillText(Number(x.toFixed(4)).toString(), p.x, axisY + 4);
      }
    }

    const yRange = Math.max(view.yMax - view.yMin, 1e-6);
    const yStep = Math.pow(10, Math.floor(Math.log10(yRange))) / 2 || 1;
    const axisX = Math.min(Math.max(origin.x, 32), width - 8);

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let y = Math.floor(view.yMin / yStep) * yStep; y <= view.yMax; y += yStep) {
      const p = toScreen(0, y);
      ctx.beginPath();
      ctx.moveTo(0, p.y);
      ctx.lineTo(width, p.y);
      ctx.stroke();
      if (Math.abs(y) > 1e-6) {
        ctx.fillText(Number(y.toFixed(4)).toString(), axisX - 6, p.y);
      }
    }
  }

  function drawGrid() {
    ctx.clearRect(0, 0, width, height);
    if (width <= 0 || height <= 0) return;

    const origin = toScreen(0, 0);
    drawGridLines(origin);

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, height);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("0", origin.x - 4, origin.y + 4);
  }

  function drawCurve() {
    if (!points || points.length < 2 || width <= 0 || height <= 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.clip();

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    let prevY = 0;

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
        const prevPt = points[i - 1];
        if (Math.abs(s.y - prevY) > height * 0.8 && prevPt && prevPt.y !== null && (pt.y * prevPt.y < 0)) {
          ctx.moveTo(s.x, s.y);
        } else {
          ctx.lineTo(s.x, s.y);
        }
      }
      prevY = s.y;
    }
    ctx.stroke();
    ctx.restore();
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
    if (rect.width <= 0 || rect.height <= 0) return;
    width = rect.width;
    height = rect.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }

  function zoom(factor) {
    const cx = (view.xMin + view.xMax) / 2;
    const cy = (view.yMin + view.yMax) / 2;
    view.xMin = cx + (view.xMin - cx) * factor;
    view.xMax = cx + (view.xMax - cx) * factor;
    view.yMin = cy + (view.yMin - cy) * factor;
    view.yMax = cy + (view.yMax - cy) * factor;
    render();
    if (typeof onViewportChange === "function") {
      onViewportChange({ ...view });
    }
  }

  function resetView() {
    view.xMin = -10;
    view.xMax = 10;
    view.yMin = -6;
    view.yMax = 6;
    render();
    if (typeof onViewportChange === "function") {
      onViewportChange({ ...view });
    }
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

  canvas.addEventListener("mousemove", (e) => {
    const mouse = toMath(e.offsetX, e.offsetY);
    coordBadge.textContent = `x: ${mouse.x.toFixed(2)}, y: ${mouse.y.toFixed(2)}`;

    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    dragStart = { x: e.clientX, y: e.clientY };

    const xSpan = ((view.xMax - view.xMin) / (width || 1)) * dx;
    const ySpan = ((view.yMax - view.yMin) / (height || 1)) * dy;

    view.xMin -= xSpan;
    view.xMax -= xSpan;
    view.yMin += ySpan;
    view.yMax += ySpan;
    render();
  });

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      if (typeof onViewportChange === "function") {
        onViewportChange({ ...view });
      }
    }
  });

  const controls = createControls(() => zoom(0.8), () => zoom(1.25), () => resetView());
  container.appendChild(controls);

  const observer = new ResizeObserver(() => resize());
  observer.observe(container);

  return {
    element: container,
    resize,
    setPoints: (newPoints) => {
      points = newPoints;
      render();
    },
    setRootMarkers: (roots) => {
      rootMarkers = roots;
      render();
    },
    resetView,
    getViewport: () => ({ ...view }),
    redraw: render,
  };
}
