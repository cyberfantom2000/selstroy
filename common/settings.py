from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    debug: bool
    log_dir: str
    log_lvl: str

    db_url: str

    redis_host: str
    redis_port: int
    redis_healthcheck_timeout_secs: int

    port: int
    host: str

    version: str

    upload_dir: str

    token_algorithm: str
    access_token_ttl_minutes: int
    refresh_token_ttl_days: int
    code_ttl_secs: int

    login_block_time_minutes: int
    login_attempts_before_block: int
