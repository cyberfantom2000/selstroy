

class DatabaseDSN:
    def __init__(self, settings):
        self.driver = settings.db_driver
        self.user = settings.db_user
        self.password = settings.db_password
        self.host = settings.db_host
        self.port = settings.db_port
        self.database = settings.db_name

    def to_url(self) -> str:
        """ Make database URL"""
        return f'{self.driver}://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}'

    def __str__(self):
        return f'{self.driver}://{self.user}:*****@{self.host}:{self.port}/{self.database}'
