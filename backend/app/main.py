import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import calculator, history, modules

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

if getattr(sys, "frozen", False):
    base_dir = getattr(sys, "_MEIPASS", os.path.dirname(sys.executable))
    frontend_dist = os.path.join(base_dir, "frontend", "dist")
    if not os.path.isdir(frontend_dist):
        frontend_dist = os.path.join(os.path.dirname(sys.executable), "frontend", "dist")
else:
    frontend_dist = os.path.join(os.path.dirname(__file__), "..", settings.frontend_dist)

if os.path.isdir(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
