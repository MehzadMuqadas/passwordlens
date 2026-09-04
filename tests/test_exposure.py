import urllib.error

import pytest

from passwordlens.exposure import (
    EXPOSURE_EXPOSED,
    EXPOSURE_NOT_EXPOSED,
    EXPOSURE_UNKNOWN,
    exposed_result,
    hash_password_for_exposure,
    lookup_password_exposure,
    not_exposed_result,
    parse_breach_response,
    split_hash,
    unknown_exposure_result,
)


def test_exposed_result_records_breach_count():
    result = exposed_result(125)

    assert result.status == EXPOSURE_EXPOSED
    assert result.breach_count == 125
    assert result.error is None


def test_not_exposed_result_has_zero_breach_count():
    result = not_exposed_result()

    assert result.status == EXPOSURE_NOT_EXPOSED
    assert result.breach_count == 0
    assert result.error is None


def test_unknown_result_does_not_claim_zero_exposure():
    result = unknown_exposure_result("service unavailable")

    assert result.status == EXPOSURE_UNKNOWN
    assert result.breach_count is None
    assert result.error == "service unavailable"


def test_exposed_result_rejects_zero_count():
    with pytest.raises(ValueError):
        exposed_result(0)


def test_exposed_result_rejects_negative_count():
    with pytest.raises(ValueError):
        exposed_result(-5)


def test_password_hash_is_40_character_sha1():
    result = hash_password_for_exposure("password")

    assert len(result) == 40
    assert result == "5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8"


def test_password_hash_is_uppercase():
    result = hash_password_for_exposure("Password123!")

    assert result == result.upper()


def test_hashing_same_password_is_deterministic():
    first = hash_password_for_exposure("PurpleElephant")
    second = hash_password_for_exposure("PurpleElephant")

    assert first == second


def test_split_hash_returns_five_character_prefix():
    hash_value = "5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8"

    prefix, suffix = split_hash(hash_value)

    assert prefix == "5BAA6"
    assert suffix == "1E4C9B93F3F0682250B6CF8331B7EE68FD8"


def test_split_hash_rejects_invalid_length():
    with pytest.raises(ValueError):
        split_hash("ABC123")


def test_split_hash_rejects_non_hexadecimal_characters():
    invalid_hash = "5BAA6ZZZZZ3F3F0682250B6CF8331B7EE68FD8"

    with pytest.raises(ValueError):
        split_hash(invalid_hash)


def test_split_hash_normalizes_lowercase_hash():
    hash_value = "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8"

    prefix, suffix = split_hash(hash_value)

    assert prefix == "5BAA6"
    assert suffix == "1E4C9B93F3F0682250B6CF8331B7EE68FD8"


def test_parse_breach_response_returns_suffix_counts():
    response = (
        "0018A45C4D1DEF81644B54AB7F969B88D65:1\n"
        "00D4F6E8FA6EECAD2A3AA415EEC418D38EC:25\n"
    )

    result = parse_breach_response(response)

    assert result["0018A45C4D1DEF81644B54AB7F969B88D65"] == 1
    assert result["00D4F6E8FA6EECAD2A3AA415EEC418D38EC"] == 25


def test_parse_breach_response_is_case_insensitive():
    response = "0018a45c4d1def81644b54ab7f969b88d65:7"

    result = parse_breach_response(response)

    assert result["0018A45C4D1DEF81644B54AB7F969B88D65"] == 7


def test_parse_breach_response_rejects_invalid_format():
    with pytest.raises(ValueError):
        parse_breach_response("INVALID_RESPONSE")


def test_parse_breach_response_rejects_invalid_suffix():
    with pytest.raises(ValueError):
        parse_breach_response("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ:1")


def test_parse_breach_response_rejects_negative_count():
    suffix = "0018A45C4D1DEF81644B54AB7F969B88D65"

    with pytest.raises(ValueError):
        parse_breach_response(f"{suffix}:-1")


def test_lookup_detects_exposed_password(monkeypatch):
    password = "password"
    full_hash = hash_password_for_exposure(password)
    prefix, suffix = split_hash(full_hash)

    response_body = f"{suffix}:12345\n"

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            pass

        def read(self):
            return response_body.encode("utf-8")

    def fake_urlopen(request, timeout):
        assert prefix in request.full_url
        assert timeout == 5
        assert request.get_header("User-agent") == "PasswordLens/1.0"
        assert request.get_header("Add-padding") == "true"

        return FakeResponse()

    monkeypatch.setattr(
        "urllib.request.urlopen",
        fake_urlopen,
    )

    result = lookup_password_exposure(password)

    assert result.status == EXPOSURE_EXPOSED
    assert result.breach_count == 12345


def test_lookup_detects_not_exposed_password(monkeypatch):
    password = "PurpleElephant"

    response_body = (
        "0018A45C4D1DEF81644B54AB7F969B88D65:1\n"
    )

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            pass

        def read(self):
            return response_body.encode("utf-8")

    monkeypatch.setattr(
        "urllib.request.urlopen",
        lambda request, timeout: FakeResponse(),
    )

    result = lookup_password_exposure(password)

    assert result.status == EXPOSURE_NOT_EXPOSED
    assert result.breach_count == 0


def test_lookup_returns_unknown_on_network_failure(monkeypatch):
    def fake_urlopen(request, timeout):
        raise urllib.error.URLError("network unavailable")

    monkeypatch.setattr(
        "urllib.request.urlopen",
        fake_urlopen,
    )

    result = lookup_password_exposure("PurpleElephant")

    assert result.status == EXPOSURE_UNKNOWN
    assert result.breach_count is None
    assert "Breach lookup unavailable" in result.error


def test_lookup_returns_unknown_on_invalid_response(monkeypatch):
    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            pass

        def read(self):
            return b"THIS IS NOT VALID"

    monkeypatch.setattr(
        "urllib.request.urlopen",
        lambda request, timeout: FakeResponse(),
    )

    result = lookup_password_exposure("PurpleElephant")

    assert result.status == EXPOSURE_UNKNOWN
    assert result.breach_count is None
    assert "Invalid breach service response" in result.error