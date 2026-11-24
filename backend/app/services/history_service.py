import json
import os
import sys
from datetime import datetime


def _get_history_file() -> str:
    if sys.platform.startswith("win"):
        base_dir = os.environ.get("APPDATA", os.path.expanduser("~"))
        storage_dir = os.path.join(base_dir, "Parf Gonodol")
    else:
        base_dir = os.environ.get("XDG_DATA_HOME", os.path.expanduser("~/.local/share"))
        storage_dir = os.path.join(base_dir, "parf_gonodol")

    os.makedirs(storage_dir, exist_ok=True)
    target = os.path.join(storage_dir, "history.json")

    legacy = os.path.join(os.path.dirname(__file__), "..", "..", "history.json")
    if os.path.exists(legacy) and not os.path.exists(target):
        try:
            with open(legacy, "r", encoding="utf-8") as f_src, open(target, "w", encoding="utf-8") as f_dst:
                f_dst.write(f_src.read())
        except Exception:
            pass

    return target


def _load() -> list[dict]:
    history_file = _get_history_file()
    if not os.path.exists(history_file):
        return []
    try:
        with open(history_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def _save(records: list[dict]) -> None:
    history_file = _get_history_file()
    try:
        with open(history_file, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


def add_record(expression: str, result: str, angle_mode: str) -> dict:
    records = _load()
    record = {
        "id": len(records) + 1,
        "expression": expression,
        "result": result,
        "angle_mode": angle_mode,
        "timestamp": datetime.now().isoformat(timespec="seconds"),
    }
    records.append(record)
    _save(records)
    return record


def get_all() -> list[dict]:
    return _load()


def clear_all() -> None:
    _save([])
