from dataclasses import dataclass

from .findings import (
    CATEGORY_PATTERN,
    CATEGORY_POLICY,
    SecurityFinding,
)
from .patterns import (
    detect_common_pattern,
    detect_repetition,
    detect_sequence,
)
from .risk import calculate_risk
from .substitutions import (
    detect_substitutions,
    normalize_substitutions,
)
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
    risk: str


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
                category=CATEGORY_PATTERN,
            )
        )

    normalized_password = normalize_substitutions(password)
    substitutions = detect_substitutions(password)

    if normalized_password != password.lower():
        normalized_pattern = detect_common_pattern(normalized_password)

        if normalized_pattern:
            substitution_details = ", ".join(
                f"{character} → {replacement}"
                for character, replacement in substitutions
            )

            findings.append(
                SecurityFinding(
                    code="PREDICTABLE_SUBSTITUTION",
                    title="Predictable character substitution detected",
                    message=(
                        "The password uses common character substitutions that "
                        f"normalize to the predictable pattern "
                        f'"{normalized_pattern}". '
                        f"Detected substitutions: {substitution_details}."
                    ),
                    severity="high",
                    category=CATEGORY_PATTERN,
                )
            )

    sequence = detect_sequence(password)

    if sequence:
        findings.append(
            SecurityFinding(
                code="SEQUENCE",
                title="Sequential pattern detected",
                message=(
                    f'The password contains a predictable sequence: "{sequence}".'
                ),
                severity="high",
                category=CATEGORY_PATTERN,
            )
        )

    repetition = detect_repetition(password)

    if repetition:
        findings.append(
            SecurityFinding(
                code="REPETITION",
                title="Repeated pattern detected",
                message=(
                    f'The password contains a repeated pattern: "{repetition}".'
                ),
                severity="high",
                category=CATEGORY_PATTERN,
            )
        )

    if len(password) < MIN_PASSWORD_LENGTH:
        findings.append(
            SecurityFinding(
                code="SHORT_PASSWORD",
                title="Password is too short",
                message="Longer passwords are generally harder to guess.",
                severity="high",
                category=CATEGORY_POLICY,
            )
        )

    if not has_uppercase:
        findings.append(
            SecurityFinding(
                code="NO_UPPERCASE",
                title="No uppercase letters",
                message="This password does not contain uppercase letters.",
                severity="low",
                category=CATEGORY_POLICY,
            )
        )

    if not has_number:
        findings.append(
            SecurityFinding(
                code="NO_NUMBER",
                title="No numbers",
                message="This password does not contain numbers.",
                severity="low",
                category=CATEGORY_POLICY,
            )
        )

    if not has_symbol:
        findings.append(
            SecurityFinding(
                code="NO_SYMBOL",
                title="No symbols",
                message="This password does not contain symbols.",
                severity="low",
                category=CATEGORY_POLICY,
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

    risk = calculate_risk(findings)

    return PasswordAnalysis(
        length=len(password),
        has_uppercase=has_uppercase,
        has_lowercase=has_lowercase,
        has_number=has_number,
        has_symbol=has_symbol,
        score=score,
        strength=strength,
        findings=findings,
        risk=risk,
    )