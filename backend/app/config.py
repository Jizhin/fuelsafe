from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://fuelsafe:fuelsafe@db:5432/fuelsafe"
    redis_url: str = "redis://redis:6379/0"
    mapbox_token: str = ""
    openweather_key: str = ""
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"

settings = Settings()
