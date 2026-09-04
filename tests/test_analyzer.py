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