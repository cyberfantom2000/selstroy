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


@dataclass
class TokenPayload:
    sub: str
    ext: datetime
    extra: dict = None


class TokenManager:
    """ Access token manager. Create and decode access token """
    def __init__(self, secrets: AuthSecrets, config: TokenConfig):
        """ Initializer
        :param secrets: token encoding params
        :param config: access token config
        """
        self.secrets = secrets
        self.config = config

    def create_access_token(self, user_id: str, data: dict = None) -> str:
        """ Create new access token
        :param user_id: user unique identifier
        :param data: additional data to encode
        :return: access token string
        """
        expire = datetime.now(timezone.utc) + timedelta(minutes=self.config.access_ttl_minutes)
        payload = TokenPayload(sub=user_id, ext=expire, extra=data)
        return jwt.encode(self._serialize_payload(payload), self.secrets.key, algorithm=self.secrets.algorithm)

    @staticmethod
    def create_simple_token() -> str:
        """ Create new simple token """
        return str(uuid.uuid4())

    def decode(self, token: str) -> TokenPayload:
        """ Decode access token
        :param token: token string
        :return: TokenPayload
        """
        data = jwt.decode(token, self.secrets.key, algorithms=[self.secrets.algorithm])
        return self._deserialize_payload(data)

    @staticmethod
    def _serialize_payload(payload: TokenPayload) -> dict:
        data = {'sub': payload.sub, 'ext': payload.ext}
        data.update(payload.extra)
        return data

    @staticmethod
    def _deserialize_payload(data: dict) -> TokenPayload:
        payload = TokenPayload(sub=data['sub'], ext=data['ext'])
        data.pop('sub')
        data.pop('ext')
        payload.extra = data
        return payload
