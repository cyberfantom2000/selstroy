from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    debug: bool
    log_dir: str
    log_lvl: str

    db_url: str

    port: int
    host: str

    version: str

    upload_dir: str

    token_algorithm: str
    access_token_ttl_minutes: int
    refresh_token_ttl_days: int

    login_block_time_minutes: int
    login_attempts_before_block: int
