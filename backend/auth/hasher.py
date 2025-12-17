from passlib.context import CryptContext


class Hasher:
    def __init__(self):
        self.context = CryptContext(schemes=['bcrypt'], deprecated='auto')

    def hash(self, string) -> str:
        return self.context.hash(string)

    def verify(self, string, string_hash) -> bool:
        return self.context.verify(string, string_hash)
