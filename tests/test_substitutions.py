from passwordlens.analyzer import analyze_password


def test_short_password_is_weak():
    result = analyze_password("abc")

    assert result.strength == "Weak"


def test_password_with_multiple_character_types():
    result = analyze_password("Password1!")

    assert result.has_uppercase is True
    assert result.has_lowercase is True
    assert result.has_number is True
    assert result.has_symbol is True


def test_strong_password_meets_basic_policy():
    result = analyze_password("StrongPassword1!")

    assert result.strength == "Strong"


def test_short_password_creates_finding():
    result = analyze_password("abc")

    codes = [finding.code for finding in result.findings]

    assert "SHORT_PASSWORD" in codes


def test_missing_character_types_create_findings():
    result = analyze_password("password")

    codes = [finding.code for finding in result.findings]

    assert "NO_UPPERCASE" in codes
    assert "NO_NUMBER" in codes
    assert "NO_SYMBOL" in codes


def test_common_pattern_creates_finding():
    result = analyze_password("password123")

    codes = [finding.code for finding in result.findings]

    assert "COMMON_PATTERN" in codes


def test_common_pattern_is_classified_as_pattern():
    result = analyze_password("password123")

    finding = next(
        finding
        for finding in result.findings
        if finding.code == "COMMON_PATTERN"
    )

    assert finding.category == "pattern"


def test_predictable_substitution_creates_finding():
    result = analyze_password("P@55w0rd")

    codes = [finding.code for finding in result.findings]

    assert "PREDICTABLE_SUBSTITUTION" in codes


def test_predictable_substitution_is_high_risk():
    result = analyze_password("P@55w0rd")

    assert result.risk == "High"


def test_normal_password_does_not_trigger_substitution():
    result = analyze_password("PurpleElephant")

    codes = [finding.code for finding in result.findings]

    assert "PREDICTABLE_SUBSTITUTION" not in codes


def test_substitution_finding_explains_detected_transformations():
    result = analyze_password("P@55w0rd")

    finding = next(
        finding
        for finding in result.findings
        if finding.code == "PREDICTABLE_SUBSTITUTION"
    )

    assert "@ → a" in finding.message
    assert "5 → s" in finding.message
    assert "0 → o" in finding.message
    assert '"password"' in finding.message