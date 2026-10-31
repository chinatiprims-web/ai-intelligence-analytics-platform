from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    secret_key: str = "development-only-change-me"
    database_url: str = "sqlite:///./analytics.db"
    cors_origins: str = "http://localhost:5173"
    access_token_expire_minutes: int = 720
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def origins(self):
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

settings = Settings()
