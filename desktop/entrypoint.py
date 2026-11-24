import os
import sys
import time
import socket
import threading
import subprocess
import traceback
import uvicorn

if "GTK_MODULES" in os.environ:
    modules = [m for m in os.environ["GTK_MODULES"].split(":") if "appmenu" not in m]
    if modules:
        os.environ["GTK_MODULES"] = ":".join(modules)
    else:
        os.environ.pop("GTK_MODULES", None)

if getattr(sys, "frozen", False):
    exe_dir = os.path.dirname(sys.executable)
    meipass = getattr(sys, "_MEIPASS", exe_dir)
    internal_dir = os.path.join(exe_dir, "_internal")
    for candidate in [meipass, internal_dir, exe_dir, os.path.join(meipass, "backend")]:
        if os.path.exists(candidate) and candidate not in sys.path:
            sys.path.insert(0, candidate)
else:
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

from app.main import app


def log_debug(msg: str):
    try:
        log_dir = os.environ.get("TEMP", os.path.expanduser("~"))
        log_file = os.path.join(log_dir, "parf_gonodol.log")
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
    except Exception:
        pass


def show_error_dialog(title: str, message: str):
    log_debug(f"FATAL: {title} - {message}")
    if sys.platform.startswith("win"):
        try:
            import ctypes
            ctypes.windll.user32.MessageBoxW(0, message, title, 0x10)
            return
        except Exception:
            pass


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def run_server(port: int):
    try:
        uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
    except Exception as exc:
        log_debug(f"Server error: {exc}\n{traceback.format_exc()}")


def get_icon_path() -> str | None:
    if getattr(sys, "frozen", False):
        exe_dir = os.path.dirname(sys.executable)
        base_dir = getattr(sys, "_MEIPASS", exe_dir)
        for folder in [base_dir, exe_dir, os.path.join(exe_dir, "_internal")]:
            icon_file = os.path.join(folder, "desktop", "icon.png")
            if os.path.exists(icon_file):
                return icon_file
    local_icon = os.path.abspath(os.path.join(os.path.dirname(__file__), "icon.png"))
    return local_icon if os.path.exists(local_icon) else None


def setup_window_icon():
    icon_png = get_icon_path()
    if not icon_png or not os.path.exists(icon_png):
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


def _find_windows_browser_binaries() -> list[str]:
    candidates = [
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%LocalAppData%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
    ]
    return [p for p in candidates if os.path.exists(p)]


def open_browser_app(url: str) -> bool:
    log_debug(f"Attempting browser fallback for {url}")
    if sys.platform.startswith("win"):
        for binary in _find_windows_browser_binaries():
            try:
                subprocess.Popen([binary, f"--app={url}"])
                log_debug(f"Launched browser app mode: {binary}")
                return True
            except Exception as exc:
                log_debug(f"Failed to launch {binary}: {exc}")

    if sys.platform.startswith("linux"):
        for browser in ["google-chrome", "chromium", "brave-browser"]:
            try:
                subprocess.Popen([browser, f"--app={url}"])
                log_debug(f"Launched Linux browser: {browser}")
                return True
            except FileNotFoundError:
                continue

    try:
        import webbrowser
        webbrowser.open(url)
        log_debug("Launched system default webbrowser")
        return True
    except Exception as exc:
        log_debug(f"Default webbrowser failed: {exc}")
        return False


def _try_webview_engine(url: str, icon_png: str | None, gui_name: str | None) -> bool:
    import webview
    log_debug(f"Starting webview with gui={gui_name}")
    webview.create_window(
        title="Parf Gonodol",
        url=url,
        width=360,
        height=580,
        min_size=(300, 460),
        resizable=True,
        background_color="#161b24",
    )
    if gui_name:
        webview.start(func=setup_window_icon, icon=icon_png, gui=gui_name)
    else:
        webview.start(func=setup_window_icon, icon=icon_png)
    return True


def launch_native_window(url: str, icon_png: str | None) -> bool:
    if sys.platform.startswith("win"):
        for engine in ["edgechromium", "qt", None]:
            try:
                return _try_webview_engine(url, icon_png, engine)
            except Exception as exc:
                log_debug(f"Webview engine '{engine}' failed: {exc}")
        return False

    try:
        return _try_webview_engine(url, icon_png, None)
    except Exception as exc:
        log_debug(f"Native webview failed: {exc}\n{traceback.format_exc()}")
        return False


def main():
    log_debug(f"Parf Gonodol desktop launcher started (frozen={getattr(sys, 'frozen', False)})")
    install_message_filters()

    port = find_free_port()
    log_debug(f"Allocated local port: {port}")

    server_thread = threading.Thread(target=run_server, args=(port,), daemon=True)
    server_thread.start()

    url = f"http://127.0.0.1:{port}"
    time.sleep(0.4)
    icon_png = get_icon_path()

    window_opened = launch_native_window(url, icon_png)
    if not window_opened:
        log_debug("Native window failed. Falling back to external browser.")
        browser_opened = open_browser_app(url)
        if not browser_opened:
            show_error_dialog(
                "Error al iniciar Parf Gonodol",
                "No fue posible abrir la interfaz gráfica ni el navegador web.\n"
                "Revise el registro en %TEMP%\\parf_gonodol.log",
            )
            return

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
