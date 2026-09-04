from passwordlens.analyzer import analyze_password


def test_short_password_is_weak():
    result = analyze_password("abc")

    assert result.strength == "Weak"
    assert result.length == 3


def test_password_with_multiple_character_types():
    result = analyze_password("Password1!")

    assert result.has_uppercase is True
    assert result.has_lowercase is True
    assert result.has_number is True
    assert result.has_symbol is True


def test_strong_password_meets_basic_policy():
    result = analyze_password("VeryStrong1!")

    assert result.strength == "Strong"

def test_short_password_creates_finding():
    result = analyze_password("abc")

    assert any(
        finding.code == "SHORT_PASSWORD"
        for finding in result.findings
    )


def test_missing_character_types_create_findings():
    result = analyze_password("password")

    finding_codes = {finding.code for finding in result.findings}

    assert "NO_UPPERCASE" in finding_codes
    assert "NO_NUMBER" in finding_codes
    assert "NO_SYMBOL" in finding_codes

def test_common_pattern_creates_finding():
    result = analyze_password("password123")

    finding_codes = {finding.code for finding in result.findings}

    assert "COMMON_PATTERN" in finding_codes