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


def main():
    port = find_free_port()
    server_thread = threading.Thread(target=run_server, args=(port,), daemon=True)
    server_thread.start()

    url = f"http://127.0.0.1:{port}"
    time.sleep(0.4)

    try:
        import webview
        window = webview.create_window(
            title="Parf Gonodol",
            url=url,
            width=380,
            height=680,
            min_size=(340, 580),
            resizable=True
        )
        webview.start()
    except Exception:
        open_browser_app(url)
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
