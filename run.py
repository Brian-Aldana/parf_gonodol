import os
import sys
import subprocess

if __name__ == "__main__":
    root_dir = os.path.abspath(os.path.dirname(__file__))
    entrypoint = os.path.join(root_dir, "desktop", "entrypoint.py")
    sys.exit(subprocess.call([sys.executable, entrypoint]))
