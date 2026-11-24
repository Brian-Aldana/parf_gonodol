import os
import sys

# Silenciar advertencias de modulos opcionales del sistema de escritorio GTK
if "GTK_MODULES" in os.environ:
    modules = [m for m in os.environ["GTK_MODULES"].split(":") if "appmenu" not in m]
    if modules:
        os.environ["GTK_MODULES"] = ":".join(modules)
    else:
        os.environ.pop("GTK_MODULES", None)

import time
import socket
import threading
import subprocess
import uvicorn

if getattr(sys, "frozen", False):
    base_dir = getattr(sys, "_MEIPASS", os.path.dirname(sys.executable))
    for candidate in [base_dir, os.path.join(base_dir, "backend")]:
        if candidate not in sys.path:
            sys.path.insert(0, candidate)
else:
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

from app.main import app


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def run_server(port: int):
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")


def open_browser_app(url: str):
    if sys.platform.startswith("win"):
        try:
            subprocess.run(["cmd", "/c", "start", "msedge", f"--app={url}"], check=True)
            return
        except Exception:
            pass
    elif sys.platform.startswith("linux"):
        for browser in ["google-chrome", "chromium", "brave-browser"]:
            try:
                subprocess.Popen([browser, f"--app={url}"])
                return
            except FileNotFoundError:
                continue

    import webbrowser
    webbrowser.open(url)


def get_icon_path() -> str:
    if getattr(sys, "frozen", False):
        base_dir = getattr(sys, "_MEIPASS", os.path.dirname(sys.executable))
        icon_path = os.path.join(base_dir, "desktop", "icon.png")
        if os.path.exists(icon_path):
            return icon_path
        return os.path.join(os.path.dirname(sys.executable), "desktop", "icon.png")
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "icon.png"))


def setup_window_icon():
    icon_png = get_icon_path()
    if not os.path.exists(icon_png):
        return

    try:
        from PyQt6.QtWidgets import QApplication
        from PyQt6.QtGui import QIcon
        app_instance = QApplication.instance()
        if app_instance:
            icon = QIcon(icon_png)
            app_instance.setWindowIcon(icon)
            for widget in app_instance.topLevelWidgets():
                widget.setWindowIcon(icon)
            return
    except Exception:
        pass

    try:
        import sys
        if "gi.repository.Gtk" in sys.modules:
            from gi.repository import Gtk
            Gtk.Window.set_default_icon_from_file(icon_png)
            for win in Gtk.Window.list_toplevels():
                win.set_icon_from_file(icon_png)
    except Exception:
        pass


def install_message_filters():
    try:
        from PyQt6.QtCore import qInstallMessageHandler

        def qt_message_handler(mode, context, message):
            if "WebEnginePage" in message or "appmenu" in message:
                return

        qInstallMessageHandler(qt_message_handler)
    except Exception:
        pass


def main():
    install_message_filters()
    port = find_free_port()
    server_thread = threading.Thread(target=run_server, args=(port,), daemon=True)
    server_thread.start()

    url = f"http://127.0.0.1:{port}"
    time.sleep(0.4)

    icon_png = get_icon_path()

    try:
        import webview
        window = webview.create_window(
            title="Parf Gonodol",
            url=url,
            width=360,
            height=580,
            min_size=(300, 460),
            resizable=True,
            background_color="#161b24"
        )
        webview.start(
            func=setup_window_icon,
            icon=icon_png if os.path.exists(icon_png) else None
        )
    except Exception:
        open_browser_app(url)
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
