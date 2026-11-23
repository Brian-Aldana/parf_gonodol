import json
import os
from datetime import datetime
from typing import Optional

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "history.json")


def _load() -> list[dict]:
    if not os.path.exists(HISTORY_FILE):
        return []
    with open(HISTORY_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(records: list[dict]) -> None:
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)


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
