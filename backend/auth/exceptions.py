from ..exceptions import BackendException


class InvalidCredentials(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'Invalid username or password')


class InvalidCode(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'Invalid code')


class CodeAlreadyUsed(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'Code already used')


class PkceFailed(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'PKCE failed')


class RefreshUnknownToken(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'Refresh token unknown')


class RefreshReuseDetected(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'Reuse refresh token detected')


class RefreshTokenExpired(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'Refresh token expired')


class CsrfFailed(BackendException):
    def __init__(self):
        BackendException.__init__(self, 'CSRF failed')


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