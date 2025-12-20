from ..exceptions import BackendException


class DatabaseException(BackendException):
    """ Based database exception """
    pass


class EntityNotFound(DatabaseException):
    """ Entity not found exception. Thrown when entity not found during CRUD operations """
    def __init__(self, entity):
        if isinstance(entity, str):
            DatabaseException.__init__(self, entity)
        else:
            DatabaseException.__init__(self, f'{entity.__name__} not found!')
