from dataclasses import dataclass


@dataclass
class SecurityFinding:
    code: str
    title: str
    message: str
    severity: str