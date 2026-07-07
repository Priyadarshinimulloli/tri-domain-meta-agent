from core.config import Settings


def test_database_defaults_to_sqlite_when_not_configured(monkeypatch):
    monkeypatch.delenv('DATABASE_URL', raising=False)
    settings = Settings(_env_file=None)
    assert settings.DATABASE_URL.startswith('sqlite')
