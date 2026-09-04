from .findings import SecurityFinding


RISK_LOW = "Low"
RISK_MODERATE = "Moderate"
RISK_HIGH = "High"


def calculate_risk(findings: list[SecurityFinding]) -> str:
    if any(finding.severity == "high" for finding in findings):
        return RISK_HIGH

    if any(finding.severity == "medium" for finding in findings):
        return RISK_MODERATE

    return RISK_LOW