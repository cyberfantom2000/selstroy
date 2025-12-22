import pytest
from uuid import uuid4
from unittest.mock import AsyncMock, Mock, ANY
from datetime import datetime, timedelta, UTC

from backend.auth.auth import AuthSystem, User, UserCreate
from backend.auth.auth import RegistrationError, LoginAlreadyUsed, TooManyAttempts, InvalidCode
from backend.auth.exceptions import InvalidCredentials
from common import settings

@pytest.fixture
def token_manager() -> Mock:
    """ Fixture for mocking token manager """
    return Mock()


@pytest.fixture
def repository() -> AsyncMock:
    """ Fixture for mocking repository """
    return AsyncMock()


@pytest.fixture
def redis() -> AsyncMock:
    """ Fixture for mocking redis """
    return AsyncMock()


@pytest.fixture
def hasher() -> Mock:
    """ Fixture for mocking hasher """
    return Mock()


@pytest.fixture
def context() -> Mock:
    """ Fixture for mocking context """
    return Mock()


@pytest.fixture
def auth_system(token_manager, repository, redis, hasher, context) -> AuthSystem:
    """ Fixture for create AuthSystem instance """
    return AuthSystem(token_manager, repository, redis, hasher, context)


@pytest.mark.asyncio
async def test_registration_login_too_short(auth_system: AuthSystem):
    """ Test registration method. Check too short login constraint
    :param auth_system: fixture of an AuthSystem
    """
    auth_system.repo.get_user.return_value = None
    valid_password = 'ValidPass6'

    user = UserCreate(login='ttt', password=valid_password, email=None, name=None)
    with pytest.raises(RegistrationError):
        await auth_system.registration(None, user)

@pytest.mark.asyncio
async def test_registration_login_too_long(auth_system: AuthSystem):
    """ Test registration method. Check too long login constraint
    :param auth_system: fixture of an AuthSystem
    """
    auth_system.repo.get_user.return_value = None
    valid_password = 'ValidPass6'

    user = UserCreate(login='s' * 65, password=valid_password, email=None, name=None)
    with pytest.raises(RegistrationError):
        await auth_system.registration(None, user)


@pytest.mark.asyncio
async def test_registration_password_too_short(auth_system: AuthSystem):
    """ Test registration method. Check too short password constraint
    :param auth_system: fixture of an AuthSystem
    """
    auth_system.repo.get_user.return_value = None
    valid_login = 'User'

    user = UserCreate(login=valid_login, password='Test5', email=None, name=None)
    with pytest.raises(RegistrationError):
        await auth_system.registration(None, user)


@pytest.mark.asyncio
async def test_registration_password_too_long(auth_system: AuthSystem):
    """ Test registration method. Check too long password constraint
    :param auth_system: fixture of an AuthSystem
    """
    auth_system.repo.get_user.return_value = None
    valid_login = 'User'

    user = UserCreate(login=valid_login, password='Te6' * 40, email=None, name=None)
    with pytest.raises(RegistrationError):
        await auth_system.registration(None, user)


@pytest.mark.asyncio
async def test_registration_password_not_strong(auth_system: AuthSystem):
    """ Test registration method. Check password is strong.
    1. Has no digits
    2. Has no uppercase characters
    3. Has no lowercase characters
    :param auth_system: fixture of an AuthSystem
    """
    auth_system.repo.get_user.return_value = None
    valid_login = 'User'

    password_without_digits = 'TestPassword'
    user = UserCreate(login=valid_login, password=password_without_digits, email=None, name=None)
    with pytest.raises(RegistrationError):
        await auth_system.registration(None, user)

    password_without_upper = 'testpassword6'
    user = UserCreate(login=valid_login, password=password_without_upper, email=None, name=None)
    with pytest.raises(RegistrationError):
        await auth_system.registration(None, user)

    password_without_lower = 'TESTPASSWORD6'
    user = UserCreate(login=valid_login, password=password_without_lower, email=None, name=None)
    with pytest.raises(RegistrationError):
        await auth_system.registration(None, user)


@pytest.mark.asyncio
async def test_registration_login_already_used(auth_system: AuthSystem):
    """ Test registration method. Check login repeating
    :param auth_system: fixture of an AuthSystem
    """
    user = UserCreate(login='test', password='test', email=None, name=None)
    with pytest.raises(LoginAlreadyUsed):
        await auth_system.registration(None, user)


@pytest.mark.asyncio
async def test_registration_successfully(auth_system: AuthSystem):
    """ Test registration method. Check successful registration
    :param auth_system: fixture of an AuthSystem
    """
    auth_system.repo.get_user.return_value = None

    user = UserCreate(login='Test', password='TestPass6', email=None, name=None)
    await auth_system.registration(None, user)

    auth_system.repo.get_user.assert_awaited_once_with(session=None, login=user.login)
    auth_system.hasher.hash.assert_called_once_with(user.password)
    auth_system.repo.create_user.assert_awaited_once_with(session=None, new_user=ANY)


@pytest.mark.asyncio
async def test_authorize_user_is_blocked(auth_system: AuthSystem):
    """ Test authorize method. Authorize failed if user is blocked
    :param auth_system: fixture of an AuthSystem
    """
    auth_system.redis.get_dict.return_value = {'attempts': 5, 'blocked_until': datetime.now(UTC) + timedelta(minutes=1)}

    with pytest.raises(TooManyAttempts):
        await auth_system.authorize(None, 'Username', 'Password1', 'code_challenge', 'state')


@pytest.mark.asyncio
async def test_authorize_invalid_credentials(auth_system: AuthSystem):
    """ Test authorize method. Authorize failed if user pass invalid credentials
    :param auth_system: fixture of an AuthSystem
    """
    auth_system.redis.get_dict.return_value = None
    auth_system.context.verify.return_value = False

    with pytest.raises(InvalidCredentials):
        await auth_system.authorize(None, 'Username', 'Password1', 'code_challenge', 'state')

    auth_system.redis.add_dict.assert_awaited_once_with(topic='login-blocks:Username', data={'attempts': 1, 'blocked_until': None})


@pytest.mark.asyncio
async def test_authorize_successfully(auth_system: AuthSystem):
    """ Test authorize method. Authorize successful
    :param auth_system: fixture of an AuthSystem
    """
    auth_system.redis.get_dict.return_value = None
    auth_system.context.verify.return_value = True
    auth_system.token_manager.generate_simple_tolen.return_value = str(uuid4())
    user = User(login='Username', password_hash=str(uuid4()))
    auth_system.repo.get_user.return_value = user

    code, state = await auth_system.authorize(None, 'Username', 'Password1', 'code_challenge', 'state')

    assert code
    assert state == 'state'
    auth_system.redis.delete_dict.assert_awaited_once_with(topic='login-blocks:Username')
    expected_data = {'user_id': user.id, 'privilege': user.privilege.name, 'challenge': 'code_challenge', 'state': 'state', 'used': False}
    auth_system.redis.add_dict.assert_awaited_once_with(topic=code, data=expected_data, ttl_secs=settings.code_ttl_secs)


@pytest.mark.asyncio
async def test_token_invalid_code(auth_system: AuthSystem):
    """ Test token method. Invalid code passed.
    1. Code not found.
    2. Code is used.
    3. Unexpected state.
    :param auth_system: fixture of an AuthSystem"""
    auth_system.redis.get_dict.return_value = None

    session = None
    code = str(uuid4())
    verifier = str(uuid4())
    state = 'state'

    with pytest.raises(InvalidCode):
        await auth_system.token(session, code, verifier, state)

    auth_system.redis.get_dict.return_value = {'used': True, 'state': state}
    with pytest.raises(InvalidCode):
        await auth_system.token(session, code, verifier, state)

    auth_system.redis.get_dict.return_value = {'used': False, 'state': 'whoops'}
    with pytest.raises(InvalidCode):
        await auth_system.token(session, code, verifier, state)


@pytest.mark.asyncio
async def test_token_pkce_failed(auth_system: AuthSystem):
    # TODO
    pass