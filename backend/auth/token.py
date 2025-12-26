import uuid
from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from jose import jwt


@dataclass
class AuthSecrets:
    algorithm: str
    key: str


@dataclass
class TokenConfig:
    access_ttl_minutes: int
    refresh_ttl_days: int


class TokenManager:
    """ Access token manager. Create and decode access token """
    def __init__(self, secrets: AuthSecrets, token_config: TokenConfig):
        """ Initializer
        :param secrets: token encoding params
        :param token_config: access token config
        """
        self.secrets = secrets
        self.token_config = token_config

    def create_access_token(self, user_id: str, data: dict = None) -> str:
        """ Create new access token
        :param user_id: user unique identifier
        :param data: additional data to encode
        :return: access token string
        """
        expire = datetime.now(timezone.utc) + timedelta(minutes=self.token_config.access_ttl_minutes)
        payload = {'sub': user_id, 'ext': expire}
        payload.update(data)
        return jwt.encode(payload, self.secrets.key, algorithm=self.secrets.algorithm)

    @staticmethod
    def create_simple_token() -> str:
        """ Create new simple token """
        return str(uuid.uuid4())

    def decode(self, token: str) -> dict:
        """ Decode access token
        :param token: token string
        :return: decoded data
        """
        return jwt.decode(token, self.secrets.key, algorithms=[self.secrets.algorithm])
