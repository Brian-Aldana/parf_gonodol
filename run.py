import os
import sys
import subprocess

if __name__ == "__main__":
    if "GTK_MODULES" in os.environ:
        modules = [m for m in os.environ["GTK_MODULES"].split(":") if "appmenu" not in m]
        if modules:
            os.environ["GTK_MODULES"] = ":".join(modules)
        else:
            os.environ.pop("GTK_MODULES", None)

    root_dir = os.path.abspath(os.path.dirname(__file__))
    entrypoint = os.path.join(root_dir, "desktop", "entrypoint.py")

    venv_py = os.path.join(root_dir, "backend", ".venv", "bin", "python")
    if sys.platform.startswith("win"):
        venv_py = os.path.join(root_dir, "backend", ".venv", "Scripts", "python.exe")

    python_bin = venv_py if os.path.exists(venv_py) else sys.executable
    sys.exit(subprocess.call([python_bin, entrypoint]))

