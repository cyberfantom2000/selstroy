import asyncio

from concurrent.futures import ThreadPoolExecutor
from passlib.context import CryptContext


class Hasher:
    """
    A thread-safe asynchronous password hashing utility using Argon2.

    This class provides asynchronous methods for hashing passwords and verifying
    them against stored hashes. It uses a thread pool executor to offload
    CPU-intensive hashing operations, preventing blocking of the main asyncio event loop.
    """
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=3)
        self.context = CryptContext(schemes=['argon2'], deprecated='auto')

    async def hash(self, string: str) -> str:
        """
        Asynchronously hash a plain text string using Argon2.
        :param string: The plain text password or string to hash.
        :return: str: The resulting Argon2 hash as a string.
        """
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self.executor, self.context.hash, string)

    async def verify(self, string: str, string_hash: str) -> bool:
        """
        Asynchronously verify a plain text string against a stored hash.
        :param string: The plain text password or string to verify.
        :param string_hash: The stored hash to compare against.
        :return bool: True if the string matches the hash, False otherwise.
        """
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self.executor, self.context.verify, string, string_hash)