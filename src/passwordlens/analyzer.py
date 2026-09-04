from dataclasses import dataclass

from .rules import (
    MIN_PASSWORD_LENGTH,
    STRENGTH_MEDIUM,
    STRENGTH_STRONG,
    STRENGTH_WEAK,
)


@dataclass
class PasswordAnalysis:
    length: int
    has_uppercase: bool
    has_lowercase: bool
    has_number: bool
    has_symbol: bool
    score: int
    strength: str


def analyze_password(password: str) -> PasswordAnalysis:
    has_uppercase = any(char.isupper() for char in password)
    has_lowercase = any(char.islower() for char in password)
    has_number = any(char.isdigit() for char in password)
    has_symbol = any(not char.isalnum() for char in password)

    score = sum(
        [
            len(password) >= MIN_PASSWORD_LENGTH,
            has_uppercase,
            has_lowercase,
            has_number,
            has_symbol,
        ]
    )

    if len(password) < MIN_PASSWORD_LENGTH:
        strength = STRENGTH_WEAK
    elif score == 5:
        strength = STRENGTH_STRONG
    elif score >= 3:
        strength = STRENGTH_MEDIUM
    else:
        strength = STRENGTH_WEAK

    return PasswordAnalysis(
        length=len(password),
        has_uppercase=has_uppercase,
        has_lowercase=has_lowercase,
        has_number=has_number,
        has_symbol=has_symbol,
        score=score,
        strength=strength,
    )