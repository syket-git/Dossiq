from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    aws_region: str = "us-east-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_session_token: str = ""
    s3_bucket: str = ""
    database_url: str = ""
    openai_api_key: str = ""
    openai_embed_model: str = "text-embedding-3-small"
    openai_chat_model: str = "gpt-4o-mini"
    embed_dimension: int = 1024
    max_upload_bytes: int = 10485760
    pinecone_api_key: str = ""
    pinecone_index_name: str = ""
    pinecone_index_host: str = ""
    pinecone_cloud: str = "aws"
    pinecone_region: str = "us-east-1"
    pinecone_ready_timeout: int = 180
    min_relevance: float = 0.25
    hitl_enabled: bool = True
    memory_turns: int = 6
    # Comma-separated list of frontend origins allowed by CORS.
    cors_origins: str = "http://localhost:3000"
    # "demo" skips Clerk and uses one fixed admin. Local use only.
    auth_mode: str = "clerk"
    clerk_issuer: str = ""
    clerk_jwks_url: str = ""
    clerk_secret_key: str = ""


@lru_cache()
def settings() -> Settings:
    return Settings()
