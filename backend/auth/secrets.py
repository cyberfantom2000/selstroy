from pathlib import Path


path = Path('.secrets')

if not path.exists():
    import secrets
    import hashlib
    random_string = secrets.token_urlsafe(32)
    hash_obj = hashlib.sha256(random_string.encode())
    hex_dig = hash_obj.hexdigest()
    with open(path, 'w') as file:
        file.write(hex_dig)

with open(path, 'r') as file:
    SECRET_KEY = file.readline()
