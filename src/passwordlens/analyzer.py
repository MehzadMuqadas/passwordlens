from dataclasses import dataclass

from .findings import SecurityFinding
from .patterns import detect_common_pattern
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
    findings: list[SecurityFinding]


def analyze_password(password: str) -> PasswordAnalysis:
    has_uppercase = any(char.isupper() for char in password)
    has_lowercase = any(char.islower() for char in password)
    has_number = any(char.isdigit() for char in password)
    has_symbol = any(not char.isalnum() for char in password)

    findings = []

    common_pattern = detect_common_pattern(password)

    if common_pattern:
        findings.append(
            SecurityFinding(
                code="COMMON_PATTERN",
                title="Common password pattern detected",
                message=(
                    f'The password contains a commonly used pattern: "{common_pattern}".'
                ),
                severity="high",
            )
        )

    if len(password) < MIN_PASSWORD_LENGTH:
        findings.append(
            SecurityFinding(
                code="SHORT_PASSWORD",
                title="Password is too short",
                message="Longer passwords are generally harder to guess.",
                severity="high",
            )
        )

    if not has_uppercase:
        findings.append(
            SecurityFinding(
                code="NO_UPPERCASE",
                title="No uppercase letters",
                message="This password does not contain uppercase letters.",
                severity="low",
            )
        )

    if not has_number:
        findings.append(
            SecurityFinding(
                code="NO_NUMBER",
                title="No numbers",
                message="This password does not contain numbers.",
                severity="low",
            )
        )

    if not has_symbol:
        findings.append(
            SecurityFinding(
                code="NO_SYMBOL",
                title="No symbols",
                message="This password does not contain symbols.",
                severity="low",
            )
        )

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
        findings=findings,
    )