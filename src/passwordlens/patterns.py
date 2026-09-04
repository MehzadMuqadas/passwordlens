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


def detect_sequence(password: str) -> str | None:
    if len(password) < 4:
        return None

    for start in range(len(password) - 3):
        chunk = password[start:start + 4]

        if all(
            ord(chunk[index + 1]) - ord(chunk[index]) == 1
            for index in range(3)
        ):
            return chunk

        if all(
            ord(chunk[index]) - ord(chunk[index + 1]) == 1
            for index in range(3)
        ):
            return chunk

    return None


def detect_repetition(password: str) -> str | None:
    if len(password) < 4:
        return None

    if len(set(password)) == 1:
        return password[0]

    for size in range(1, len(password) // 2 + 1):
        if len(password) % size != 0:
            continue

        unit = password[:size]

        if unit * (len(password) // size) == password:
            return unit

    return None