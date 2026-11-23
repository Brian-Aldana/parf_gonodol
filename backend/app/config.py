from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_title: str = "Parf Gonodol"
    default_precision: int = 10
    max_expression_length: int = 512
    history_file: str = "history.json"
    cors_origins: tuple[str, ...] = ("http://localhost:5173", "http://localhost:3000")
    frontend_dist: str = "../frontend/dist"


settings = Settings()
