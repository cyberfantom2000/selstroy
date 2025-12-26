import re

from .exceptions import InvalidSlug


SLUG_REGEX = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def raise_for_invalid_slug(slug: str) -> None:
    """ Slug validate helper. Check slug and raise InvalidSlug for bad slug
    :raises InvalidSlug: if slug is invalid
    """
    if any([not isinstance(slug, str), not (1 <= len(slug) <= 100), not bool(SLUG_REGEX.fullmatch(slug))]):
        raise InvalidSlug(slug)
