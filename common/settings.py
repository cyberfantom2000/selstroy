from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    debug: bool
    log_dir: str
    log_lvl: str

    port: int
    host: str

    api_version: str
    api_title: str
    api_description: str

    db_driver: str
    db_user: str
    db_password: str
    db_host: str
    db_port: int
    db_name: str

    redis_host: str
    redis_port: int
    redis_healthcheck_timeout_secs: int
    redis_local_capacity: int

    upload_dir: str

    token_algorithm: str
    access_token_ttl_minutes: int
    refresh_token_ttl_days: int
    refresh_token_ttl_days_after_expired: int
    code_ttl_secs: int

    login_block_time_minutes: int
    login_attempts_before_block: int
