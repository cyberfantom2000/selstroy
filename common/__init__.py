from dotenv import load_dotenv

from .settings import Settings
from .logger import get_logger

load_dotenv()
settings = Settings()
