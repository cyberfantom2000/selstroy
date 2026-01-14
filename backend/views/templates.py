from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from pathlib import Path

templates = Jinja2Templates(directory=Path('/Users/daniil/py/selstroy/frontend/templates'))
static_files = StaticFiles(directory=Path('/Users/daniil/py/selstroy/frontend/static'))
