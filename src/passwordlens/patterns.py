COMMON_PATTERNS = {
    "123456",
    "12345678",
    "password",
    "qwerty",
    "abc123",
}


def detect_common_pattern(password: str) -> str | None:
    normalized = password.lower()

    for pattern in COMMON_PATTERNS:
        if pattern in normalized:
            return pattern

    return None