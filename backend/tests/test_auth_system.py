import pytest
import hashlib
import base64
from uuid import uuid4
from unittest.mock import AsyncMock, Mock, ANY
from datetime import datetime, timedelta, UTC

from common import settings

from backend.auth.auth import AuthSystem, User, UserCreate, RefreshToken
from backend.auth.auth import (RegistrationError, LoginAlreadyUsed, TooManyAttempts,
                               InvalidCode, InvalidCredentials, PkceFailed, RefreshFailed)


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
    """ Test token method. Invalid verifier passed.
    :param auth_system: fixture of an AuthSystem"""
    session = None
    code = str(uuid4())
    challenge = base64.urlsafe_b64encode(hashlib.sha256('test'.encode()).digest()).rstrip(b'=').decode()
    verifier = str(uuid4())
    state = 'state'

    auth_system.redis.get_dict.return_value = {'used': False, 'state': state, 'challenge': challenge}

    with pytest.raises(PkceFailed):
        await auth_system.token(session, code, verifier, state)


@pytest.mark.asyncio
async def test_token_successfully(auth_system: AuthSystem):
    """ Test token method. Token request successful.
    :param auth_system: fixture of an AuthSystem
    """
    session = None
    code = str(uuid4())
    verifier = str(uuid4())
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b'=').decode()
    state = 'state'
    user_id = str(uuid4())
    privilege = 'test'

    auth_system.redis.get_dict.return_value = {'user_id': user_id,
                                               'privilege': privilege,
                                               'used': False,
                                               'state': state,
                                               'challenge': challenge}

    access = str(uuid4())
    refresh = str(uuid4())
    csrf = str(uuid4())
    auth_system.token_manager.create_access_token.return_value = access
    auth_system.token_manager.create_simple_token.side_effect = [refresh, csrf]

    token_family = await auth_system.token(session, code, verifier, state)

    assert token_family.access == access
    assert token_family.refresh == refresh
    assert token_family.csrf == csrf
    auth_system.token_manager.create_access_token.assert_called_once_with(user_id, {'privilege': privilege})
    assert auth_system.token_manager.create_simple_token.call_count == 2
    auth_system.repo.create_token.assert_awaited_once_with(session, ANY)


@pytest.mark.asyncio
async def test_refresh_failed(auth_system: AuthSystem):
    """ Test refresh method. Bad token passed
    :param auth_system: fixture of an AuthSystem
    """
    auth_system.repo.get_token.return_value = None

    with pytest.raises(RefreshFailed):
        await auth_system.refresh(None, 'test')


@pytest.mark.asyncio
async def test_refresh_successfully(auth_system: AuthSystem):
    """ Test refresh method. Refresh successful
    1. Passed token revoked
    2. New TokenFamily created
    :param auth_system: fixture of an AuthSystem
    """
    session = None
    refresh_token = RefreshToken(token=str(uuid4()), csrf=str(uuid4()), user_id=str(uuid4()))
    refresh_token.user = User(login='Username', password_hash=str(uuid4()), privilege='test')
    auth_system.repo.get_token.return_value = refresh_token

    access = str(uuid4())
    refresh = str(uuid4())
    csrf = str(uuid4())
    auth_system.token_manager.create_access_token.return_value = access
    auth_system.token_manager.create_simple_token.side_effect = [refresh, csrf]

    token_family = await auth_system.refresh(session, refresh_token.token)

    auth_system.repo.get_token.assert_called_once_with(session=session, token=refresh_token.token)
    assert refresh_token.revoked == True
    auth_system.repo.update_token.assert_called_once_with(refresh_token)
    auth_system.repo.create_token.assert_awaited_once_with(session, ANY)
    assert token_family.access == access
    assert token_family.refresh == refresh
    assert token_family.csrf == csrf


@pytest.mark.asyncio
async def test_revoke_one_drain(auth_system: AuthSystem):
    """ Test revoke_one method. Try to revoke token but token not found. Method mus be idempotent
    :param auth_system: fixture of an AuthSystem
    """
    auth_system.repo.get_token.return_value = None
    await auth_system.revoke_one(None, 'test')
    auth_system.repo.get_token.assert_awaited_once_with(None, 'test')


@pytest.mark.asyncio
async def test_revoke_one_successful(auth_system: AuthSystem):
    """ Test revoke_one method. Successful revoke one token
    :param auth_system: fixture of an AuthSystem
    """
    refresh_token = RefreshToken(token=str(uuid4()), csrf=str(uuid4()), user_id=str(uuid4()))
    auth_system.repo.get_token.return_value = refresh_token

    await auth_system.revoke_one(None, refresh_token.token)

    auth_system.repo.get_token.assert_awaited_once_with(None, refresh_token.token)
    auth_system.repo.update_token.assert_awaited_once_with(None, refresh_token)
    assert refresh_token.revoked == True


@pytest.mark.asyncio
async def test_revoke_all_drain(auth_system: AuthSystem):
    """ Test revoke_all method. Try to revoke all user's tokens but token not found. Method mus be idempotent
    :param auth_system: fixture of an AuthSystem
    """
    auth_system.repo.get_token.return_value = None
    await auth_system.revoke_all(None, 'test')
    auth_system.repo.get_token.assert_awaited_once_with(None, 'test')


@pytest.mark.asyncio
async def test_revoke_all_successful(auth_system: AuthSystem):
    """ Test revoke_all method. Successful revoke all user's tokens
    :param auth_system: fixture of an AuthSystem
    """
    token1 = RefreshToken(token=str(uuid4()), csrf=str(uuid4()), user_id=str(uuid4()))
    user = User(login='Username', password_hash=str(uuid4()), privilege='test')
    user.refresh_tokens = [RefreshToken(token=str(uuid4()), csrf=str(uuid4()), user_id=str(uuid4()))]
    token1.user = user

    auth_system.repo.get_token.return_value = token1

    await auth_system.revoke_all(None, token1.token)

    auth_system.repo.get_token.assert_awaited_once_with(None, token1.token)
    auth_system.repo.update_token.assert_awaited_once_with(None, token1)
    assert token1.revoked == True
    assert any([el.revoked == True for el in user.refresh_tokens])