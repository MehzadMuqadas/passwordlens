SUBSTITUTION_MAP = {
    "@": "a",
    "0": "o",
    "1": "i",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "$": "s",
    "!": "i",
}


def normalize_substitutions(password: str) -> str:
    normalized = password.lower()

    for character, replacement in SUBSTITUTION_MAP.items():
        normalized = normalized.replace(character, replacement)

    return normalized


def detect_substitutions(password: str) -> list[tuple[str, str]]:
    substitutions = []

    for character in password.lower():
        if character in SUBSTITUTION_MAP:
            substitutions.append(
                (character, SUBSTITUTION_MAP[character])
            )

    return substitutions