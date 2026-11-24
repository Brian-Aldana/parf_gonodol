import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import calculator, history, modules, plotter

app = FastAPI(title=settings.app_title, docs_url="/docs", redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)

app.include_router(calculator.router)
app.include_router(history.router)
app.include_router(modules.router)
app.include_router(plotter.router)

if getattr(sys, "frozen", False):
    exe_dir = os.path.dirname(sys.executable)
    base_dir = getattr(sys, "_MEIPASS", exe_dir)
    frontend_candidates = [
        os.path.join(base_dir, "frontend", "dist"),
        os.path.join(exe_dir, "frontend", "dist"),
        os.path.join(exe_dir, "_internal", "frontend", "dist"),
    ]
    frontend_dist = next((p for p in frontend_candidates if os.path.isdir(p)), frontend_candidates[0])
else:
    frontend_dist = os.path.join(os.path.dirname(__file__), "..", settings.frontend_dist)

if os.path.isdir(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
