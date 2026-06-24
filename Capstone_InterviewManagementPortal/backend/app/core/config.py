from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or defaults.

    Attributes:
        MONGO_URI (str): The connection URI for the MongoDB database.
            Defaults to 'mongodb://localhost:27017' if not set in environment.
        DB_NAME (str): The name of the MongoDB database.
            Defaults to 'CapstoneProject' if not set in environment.
    """
    
    # MongoDB configuration
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "CapstoneProject"

    # Model configuration for pydantic_settings
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Settings instance to be imported by other modules
settings = Settings()
