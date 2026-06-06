import os
from pathlib import Path
from dotenv import load_dotenv


def _find_env_file() -> Path:
    """Locate .env starting from this file's directory and walking up."""
    here = Path(__file__).resolve()
    for candidate in [here.parent / ".env", here.parents[2] / ".env"]:
        if candidate.is_file():
            return candidate
    # Fallback: try workspace root
    return here.parents[2] / ".env"


load_dotenv(dotenv_path=_find_env_file(), override=False)


def _env(key: str, default: str = "") -> str:
    return os.getenv(key, default).strip()


class Settings:
    """Thin wrapper around environment variables.
    
    Works without pydantic-settings — reads directly from os.environ
    (populated by python-dotenv from the nearest .env file).
    """

    # App
    app_env: str = _env("APP_ENV", "development")
    app_origin: str = _env("APP_ORIGIN", "http://localhost:5173")
    app_secret_key: str = _env("APP_SECRET_KEY", "")
    encryption_key: str = _env("APP_ENCRYPTION_KEY", "")

    # Appwrite
    appwrite_endpoint: str = _env("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1")
    appwrite_project_id: str = _env("APPWRITE_PROJECT_ID", "")
    appwrite_api_key: str = _env("APPWRITE_API_KEY", "")
    appwrite_database_id: str = _env("APPWRITE_DATABASE_ID", "alaafia")
    appwrite_bucket_id: str = _env("APPWRITE_BUCKET_ID", "")

    # Cencori
    cencori_endpoint: str = _env("CENCORI_ENDPOINT", _env("CENCORI_BASE_URL", "https://api.cencori.com"))
    cencori_api_key: str = _env("CENCORI_API_KEY", "")

    # YarnGPT
    yarngpt_endpoint: str = _env("YARNGPT_ENDPOINT", "")
    yarngpt_api_key: str = _env("YARNGPT_API_KEY", "")

    # Aethex
    aethex_endpoint: str = _env("AETHEX_ENDPOINT", "")
    aethex_api_key: str = _env("AETHEX_API_KEY", "")

    # GTranslate
    gtranslate_default_language: str = _env("GTRANSLATE_DEFAULT_LANGUAGE", "en")


settings = Settings()
