from dataclasses import dataclass


CATEGORY_POLICY = "policy"
CATEGORY_PATTERN = "pattern"
CATEGORY_EXPOSURE = "exposure"


@dataclass
class SecurityFinding:
    code: str
    title: str
    message: str
    severity: str
    category: str