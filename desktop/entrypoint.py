import os
import sys
import time
import socket
import threading
import subprocess
import uvicorn

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
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


def setup_window_icon():
    icon_png = os.path.abspath(os.path.join(os.path.dirname(__file__), "icon.png"))
    if not os.path.exists(icon_png):
        return

    try:
        from PyQt6.QtWidgets import QApplication
        from PyQt6.QtGui import QIcon
        app = QApplication.instance()
        if app:
            app.setWindowIcon(QIcon(icon_png))
    except Exception:
        pass

    try:
        import gi
        gi.require_version("Gtk", "3.0")
        from gi.repository import Gtk
        Gtk.Window.set_default_icon_from_file(icon_png)
    except Exception:
        pass


def main():
    port = find_free_port()
    server_thread = threading.Thread(target=run_server, args=(port,), daemon=True)
    server_thread.start()

    url = f"http://127.0.0.1:{port}"
    time.sleep(0.4)

    setup_window_icon()

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
        webview.start(func=setup_window_icon)
    except Exception:
        open_browser_app(url)
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
