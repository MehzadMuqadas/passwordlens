from passwordlens.findings import (
    CATEGORY_PATTERN,
    CATEGORY_POLICY,
    SecurityFinding,
)
from passwordlens.risk import (
    RISK_HIGH,
    RISK_LOW,
    RISK_MODERATE,
    calculate_risk,
)


def test_no_findings_is_low_risk():
    assert calculate_risk([]) == RISK_LOW


def test_high_severity_finding_is_high_risk():
    finding = SecurityFinding(
        code="COMMON_PATTERN",
        title="Common password pattern detected",
        message="A common pattern was detected.",
        severity="high",
        category=CATEGORY_PATTERN,
    )

    assert calculate_risk([finding]) == RISK_HIGH


def test_medium_severity_finding_is_moderate_risk():
    finding = SecurityFinding(
        code="TEST_MEDIUM",
        title="Medium risk finding",
        message="A medium severity issue was detected.",
        severity="medium",
        category=CATEGORY_PATTERN,
    )

    assert calculate_risk([finding]) == RISK_MODERATE


def test_low_severity_findings_are_low_risk():
    findings = [
        SecurityFinding(
            code="NO_NUMBER",
            title="No numbers",
            message="This password does not contain numbers.",
            severity="low",
            category=CATEGORY_POLICY,
        ),
        SecurityFinding(
            code="NO_SYMBOL",
            title="No symbols",
            message="This password does not contain symbols.",
            severity="low",
            category=CATEGORY_POLICY,
        ),
    ]

    assert calculate_risk(findings) == RISK_LOW