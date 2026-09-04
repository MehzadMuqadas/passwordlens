from dataclasses import dataclass
import hashlib
import urllib.error
import urllib.request


EXPOSURE_EXPOSED = "exposed"
EXPOSURE_NOT_EXPOSED = "not_exposed"
EXPOSURE_UNKNOWN = "unknown"

HASH_PREFIX_LENGTH = 5
SHA1_HASH_LENGTH = 40

HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range/{prefix}"
DEFAULT_TIMEOUT = 5


@dataclass
class ExposureResult:
    status: str
    breach_count: int | None = None
    error: str | None = None


def exposed_result(breach_count: int) -> ExposureResult:
    if breach_count < 1:
        raise ValueError("breach_count must be at least 1")

    return ExposureResult(
        status=EXPOSURE_EXPOSED,
        breach_count=breach_count,
    )


def not_exposed_result() -> ExposureResult:
    return ExposureResult(
        status=EXPOSURE_NOT_EXPOSED,
        breach_count=0,
    )


def unknown_exposure_result(error: str | None = None) -> ExposureResult:
    return ExposureResult(
        status=EXPOSURE_UNKNOWN,
        breach_count=None,
        error=error,
    )


def hash_password_for_exposure(password: str) -> str:
    return hashlib.sha1(
        password.encode("utf-8")
    ).hexdigest().upper()


def split_hash(hash_value: str) -> tuple[str, str]:
    normalized_hash = hash_value.strip().upper()

    if len(normalized_hash) != SHA1_HASH_LENGTH:
        raise ValueError(
            "SHA-1 hash must contain exactly 40 hexadecimal characters"
        )

    try:
        int(normalized_hash, 16)
    except ValueError as exc:
        raise ValueError(
            "SHA-1 hash must contain only hexadecimal characters"
        ) from exc

    return (
        normalized_hash[:HASH_PREFIX_LENGTH],
        normalized_hash[HASH_PREFIX_LENGTH:],
    )


def parse_breach_response(response_text: str) -> dict[str, int]:
    results = {}

    for line in response_text.splitlines():
        line = line.strip()

        if not line:
            continue

        parts = line.split(":")

        if len(parts) != 2:
            raise ValueError("Invalid breach response format")

        suffix, count_text = parts

        suffix = suffix.strip().upper()
        count_text = count_text.strip()

        if len(suffix) != SHA1_HASH_LENGTH - HASH_PREFIX_LENGTH:
            raise ValueError("Invalid hash suffix length")

        try:
            int(suffix, 16)
        except ValueError as exc:
            raise ValueError("Invalid hexadecimal hash suffix") from exc

        try:
            count = int(count_text)
        except ValueError as exc:
            raise ValueError("Invalid breach count") from exc

        if count < 0:
            raise ValueError("Breach count cannot be negative")

        results[suffix] = count

    return results


def lookup_password_exposure(
    password: str,
    timeout: int = DEFAULT_TIMEOUT,
) -> ExposureResult:
    full_hash = hash_password_for_exposure(password)
    prefix, suffix = split_hash(full_hash)

    url = HIBP_RANGE_URL.format(prefix=prefix)

    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "PasswordLens/1.0",
            "Add-Padding": "true",
        },
        method="GET",
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            response_text = response.read().decode("utf-8")

    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        return unknown_exposure_result(
            f"Breach lookup unavailable: {exc}"
        )

    try:
        results = parse_breach_response(response_text)
    except ValueError as exc:
        return unknown_exposure_result(
            f"Invalid breach service response: {exc}"
        )

    breach_count = results.get(suffix)

    if breach_count is None or breach_count == 0:
        return not_exposed_result()

    return exposed_result(breach_count)