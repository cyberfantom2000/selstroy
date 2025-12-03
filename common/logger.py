import logging
import os
from logging.handlers import RotatingFileHandler

from common.settings import Settings

logging.addLevelName(logging.INFO, "INF")
logging.addLevelName(logging.WARNING, "WRN")
logging.addLevelName(logging.ERROR, "ERR")
logging.addLevelName(logging.DEBUG, "DBG")
logging.addLevelName(logging.CRITICAL, "CRT")

levels = {"debug": logging.DEBUG,
          "info": logging.INFO,
          "warning": logging.WARNING,
          "error": logging.ERROR,
          "critical": logging.CRITICAL}

loggers = {}

def get_logger(settings: Settings, category: str = None, store: bool = True) -> logging.Logger:
    """ Create logger. Logger with category save in container and just returned when calls with the same category
    :param settings: application settings. Used for set up log level
    :param category: logger category. If equal None logger will be created without category
    :param store: store logger by category
    :return: logging.Logger object
    """
    global loggers

    if category and category in loggers:
        return loggers[category]

    log_level = levels[settings.log_lvl] if settings.log_lvl in levels else logging.INFO

    logger = logging.getLogger(category)
    logger.setLevel(log_level)

    formatter = logging.Formatter("[%(asctime)s][%(levelname)s][%(name)s]: %(message)s", datefmt="%d.%m.%y %H:%M:%S")

    console = logging.StreamHandler()
    console.setLevel(log_level)
    console.setFormatter(formatter)

    os.makedirs(settings.log_dir, exist_ok=True)
    log_path = os.path.join(settings.log_dir, f'{category}.log')
    file_handler = RotatingFileHandler(log_path, maxBytes=5_000_000, backupCount=5, encoding='utf-8')
    file_handler.setLevel(log_level)
    file_handler.setFormatter(formatter)

    for handler in (console, file_handler):
        logger.addHandler(handler)

    if category and store:
        loggers[category] = logger

    return logger
