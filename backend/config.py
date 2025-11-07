from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """
    Application settings using Pydantic Settings.
    Automatically loads from environment variables and .env file.
    """
    
    # Application settings
    app_env: str = "development"
    port: int = 8000
    
    # MongoDB settings
    mongodb_uri: str
    
    # Spotify API settings
    spotify_client_id: str
    spotify_client_secret: str
    spotify_redirect_uri: str = ""
    
    # Frontend settings
    frontend_url: str = ""
    
    # CORS settings
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """
        Parse CORS origins from comma-separated string to list.
        
        Returns:
            List of allowed CORS origins
        """
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Global settings instance
settings = Settings()