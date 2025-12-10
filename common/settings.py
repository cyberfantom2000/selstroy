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
