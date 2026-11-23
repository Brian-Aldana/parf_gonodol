import os
import sys
import subprocess

if __name__ == "__main__":
    entrypoint = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "desktop", "entrypoint.py"))
    sys.exit(subprocess.call([sys.executable, entrypoint]))
