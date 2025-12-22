from ..exceptions import BackendException


class InvalidCredentials(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'Invalid username or password')


class InvalidCode(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'Invalid code')


class PkceFailed(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'PKCE failed')


class RefreshFailed(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'Refresh failed')


class CouldNotValidateCredentials(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'Could not validate credentials')


class RegistrationError(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'Invalid login or password')


class LoginAlreadyUsed(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'Login already used')


class TooManyAttempts(BackendException):
    def __init__(self, date):
        BackendException.__init__(self, f'Too many login attempts. You are blocked until {date}')