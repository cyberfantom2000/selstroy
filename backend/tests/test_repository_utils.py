import pytest

from backend.repository.utils import InvalidSlug, raise_for_invalid_slug


def test_check_invalid_slug():
    """ Test that invalid slugs raise exception """
    invalid_slugs = [ "", " ", "hello world", "hello_world", "hello--world", "-hello", "hello-", "Hello-world",
                      "hello-World", "HELLO", "привет-мир", "hello@world", "hello#world", "hello/world", "hello.world",
                      "hello,world", "hello+world", "hello=world", "hello?world", "hello!world", "hello(world)",
                      "hello[world]", "hello{world}", "hello|world", "hello\\world", "hello:world", "hello;world",
                      "hello\"world", "hello'world", "hello<world>", "hello\tworld", "hello\nworld" ]

    for slug in invalid_slugs:
        with pytest.raises(InvalidSlug):
            raise_for_invalid_slug(slug)


def test_check_valid_slug():
    """ Test that valid slugs not raise exception """
    valid_slugs = ["a", "post", "hello-world", "hello-world-123", "post-1", "post-123-test", "a1", "a1-b2",
                   "abc-123-def", "0", "0-test", "test-0", "long-slug-with-many-parts", "test123", "test123-test456",
                   "slug-with-9-numbers-8", "x" * 100 ]

    for slug in valid_slugs:
        raise_for_invalid_slug(slug)
