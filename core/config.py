"""
app/core/config.py

Central configuration object. Everything that varies between dev/staging/
production (DB URL, secrets, model names, file paths) lives here and is
loaded once from environment variables / .env.
"""
import secrets
import warnings

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Database ────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./tridomain.db"
    GOOGLE_EMAIL_DOMAINS: str = "gmail.com,googlemail.com"

    @property
    def database_url(self) -> str:
        return self.DATABASE_URL

    @property
    def allowed_google_email_domains(self) -> list[str]:
        return [domain.strip().lower() for domain in self.GOOGLE_EMAIL_DOMAINS.split(',') if domain.strip()]


    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── Groq ────────────────────────────────────────────────────
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # ── RAG ─────────────────────────────────────────────────────
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    FAISS_INDEX_PATH: str = ".rag/index_store/faiss.index"
    FAISS_DOCS_PATH: str = ".rag/index_store/docs.json"
    HF_TOKEN: str = ""

    # ── Reports ─────────────────────────────────────────────────
    REPORTS_DIR: str = "./reports"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.JWT_SECRET_KEY:
            warnings.warn(
                "JWT_SECRET_KEY is not set — generating a random secret for this "
                "process only. Tokens will stop working on restart, and this is "
                "NOT safe for any deployment with more than one server instance. "
                "Set JWT_SECRET_KEY in your .env before deploying.",
                stacklevel=2,
            )
            self.JWT_SECRET_KEY = secrets.token_urlsafe(48)
        elif len(self.JWT_SECRET_KEY) < 32:
            warnings.warn(
                "JWT_SECRET_KEY is shorter than 32 characters — use a longer, "
                "random value in production.",
                stacklevel=2,
            )


settings = Settings()