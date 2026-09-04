# MILESTONE 10 — FINAL BUILD

**53/53 passed.** 
Threat model saved. Architecture saved. Packaging works. CLI works.

Now we're at the actual finale.

We're going to do this in **3 final passes**:

1. **Polish the CLI**
2. **Rewrite the README**
3. **Final verification + commit + push**

No more feature creep after this unless we discover something genuinely broken.

---

# 10.1 — Polish the CLI

Open:

```bash
code src/passwordlens/main.py
```

Replace the entire file with:

```python
from .analyzer import analyze_password


def print_finding(finding):
    print(f"\n[{finding.severity.upper()}] {finding.title}")
    print(f"  {finding.message}")


def print_analysis(result):
    print("\n" + "=" * 50)
    print("PASSWORDLENS ANALYSIS")
    print("=" * 50)

    print(f"\nPassword Strength : {result.strength.upper()}")
    print(f"Security Risk     : {result.risk.upper()}")

    print("\nComposition")
    print("-" * 50)
    print(f"Length            : {result.length}")
    print(f"Uppercase         : {'Yes' if result.has_uppercase else 'No'}")
    print(f"Lowercase         : {'Yes' if result.has_lowercase else 'No'}")
    print(f"Numbers           : {'Yes' if result.has_number else 'No'}")
    print(f"Symbols           : {'Yes' if result.has_symbol else 'No'}")

    print("\nSecurity Findings")
    print("-" * 50)

    if result.findings:
        for finding in result.findings:
            print_finding(finding)
    else:
        print("  No issues detected.")

    print("\n" + "=" * 50)
    print("Analysis complete.")
    print("=" * 50)


def main():
    print("=" * 50)
    print("PasswordLens")
    print("Explainable Password Security Analyzer")
    print("=" * 50)

    password = input("\nEnter a password to analyze: ")

    if not password:
        print("\nError: Password cannot be empty.")
        return

    exposure_choice = input(
        "\nCheck known breach exposure? [y/N]: "
    ).strip().lower()

    check_exposure = exposure_choice == "y"

    result = analyze_password(
        password,
        check_exposure=check_exposure,
    )

    print_analysis(result)


if __name__ == "__main__":
    main()
```

Save:

**⌘ + S**

---

# Test the polished CLI

Run:

```bash
passwordlens
```

Enter:

```text
P@55w0rd
```

Then:

```text
n
```

You should get a much cleaner presentation showing:

```text
PASSWORDLENS ANALYSIS

Password Strength : ...
Security Risk     : HIGH

Composition
--------------------------------------------------
...

Security Findings
--------------------------------------------------

[HIGH] Predictable character substitution detected
...
```

### Then run the tests again:

```bash
pytest
```

We need:

```text
53 passed
```

---

# 10.2 — THE README

Now we're going to make the GitHub landing page actually sell the project.

Open:

```bash
code README.md
```

Replace the entire README with:

````markdown
# PasswordLens

> **Don't just score passwords. Explain their risk.**

PasswordLens is an explainable password security analyzer designed to identify predictable password behavior that basic character-composition checks can miss.

Instead of asking only whether a password contains uppercase letters, numbers, and symbols, PasswordLens looks for patterns that may remain predictable from an attacker's perspective.

## Why PasswordLens?

A password can satisfy traditional complexity requirements while still being highly predictable.

For example:

```text
P@55w0rd
````

contains uppercase characters, lowercase characters, numbers, and a symbol.

However, the substitutions:

```text
@ -> a
5 -> s
0 -> o
```

normalize the password to the predictable pattern:

```text
password
```

PasswordLens is designed to make this type of risk visible and explainable.

---

## Features

### Password Composition Analysis

Evaluates:

* Password length
* Uppercase characters
* Lowercase characters
* Numbers
* Symbols

### Predictable Pattern Detection

Detects patterns such as:

* Common passwords
* Sequential characters
* Repeated patterns

### Fake Complexity Detection

Identifies predictable character substitutions such as:

```text
@ -> a
0 -> o
5 -> s
$ -> s
```

and checks whether the normalized password corresponds to a predictable pattern.

### Explainable Security Findings

Instead of returning only a score, PasswordLens produces structured findings containing:

* Finding code
* Title
* Explanation
* Severity
* Category

Current finding categories include:

```text
policy
pattern
exposure
```

### Breached Password Detection

PasswordLens optionally checks whether a password appears in known breach data.

The exposure check uses a privacy-preserving range-query design:

1. The password is hashed locally.
2. Only the first five characters of the SHA-1 hash are sent to the breach service.
3. Matching hash suffixes are returned.
4. The complete suffix comparison occurs locally.

The complete password is never intentionally transmitted to the breach service.

### Explicit Uncertainty Handling

Exposure results can be:

```text
Exposed
Not Exposed
Unknown
```

If the external service is unavailable, PasswordLens does not incorrectly interpret the failure as evidence that the password is safe.

---

## Architecture

```text
                    +----------------+
                    |   User Input   |
                    +-------+--------+
                            |
                            v
                  +-------------------+
                  | Password Analyzer |
                  +---------+---------+
                            |
          +-----------------+------------------+
          |                 |                  |
          v                 v                  v
   Policy Analysis   Pattern Analysis   Exposure Analysis
          |                 |                  |
          |          +------+-------+          |
          |          |      |       |          |
          |          v      v       v          |
          |       Common  Sequence Repeat      |
          |       Pattern          /Pattern     |
          |                 |                  |
          |                 v                  |
          |          Substitution              |
          |            Detection               |
          |                 |                  |
          +-----------------+------------------+
                            |
                            v
                  +-------------------+
                  | Security Findings |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  |    Risk Engine    |
                  +---------+---------+
                            |
                            v
                    Risk Classification
```

The project intentionally separates:

```text
rules
patterns
substitutions
exposure
findings
risk
analyzer
main
```

This keeps individual security checks modular and testable.

More detail is available in:

* `docs/ARCHITECTURE.md`
* `docs/THREAT_MODEL.md`
* `docs/PRIVACY.md`

---

## Policy vs. Risk

PasswordLens deliberately separates password policy from observed security risk.

### Policy

Answers questions such as:

* Is the password long enough?
* Does it contain uppercase characters?
* Does it contain lowercase characters?
* Does it contain numbers?
* Does it contain symbols?

### Risk

Looks for:

* Common patterns
* Sequential patterns
* Repetition
* Predictable substitutions
* Known breach exposure

This distinction matters because satisfying a composition policy does not necessarily mean a password is difficult to guess.

---

## Example

Running PasswordLens:

```text
$ passwordlens

==================================================
PasswordLens
Explainable Password Security Analyzer
==================================================

Enter a password to analyze: P@55w0rd

Check known breach exposure? [y/N]: n
```

The analyzer identifies the predictable substitution pattern:

```text
@ -> a
5 -> s
0 -> o
```

and explains that the normalized password corresponds to:

```text
password
```

This is the core idea behind PasswordLens:

> **Complexity is not the same thing as unpredictability.**

---

## Installation

Clone the repository and create a virtual environment:

```bash
git clone https://github.com/MehzadMuqadas/passwordlens.git
cd passwordlens

python3 -m venv .venv
source .venv/bin/activate
```

Install PasswordLens:

```bash
pip install .
```

The CLI is then available as:

```bash
passwordlens
```

---

## Running Tests

PasswordLens uses `pytest`.

Run:

```bash
pytest
```

The test suite covers:

* Password composition
* Security findings
* Common patterns
* Sequential patterns
* Repetition
* Predictable substitutions
* Risk classification
* Exposure hashing
* Hash splitting
* Breach-response parsing
* Exposure lookup failures
* Exposure findings

External breach requests are mocked during testing so the test suite does not depend on network availability.

---

## Security and Privacy

PasswordLens treats password input as sensitive data.

The project follows these principles:

* Analyze locally whenever possible.
* Do not intentionally log or persist plaintext passwords.
* Minimize information sent to external services.
* Treat external security information as potentially unavailable.
* Never interpret an unavailable exposure check as confirmation of safety.
* Avoid presenting password analysis as a security guarantee.

The SHA-1 operation used for breach lookup is part of the range-query protocol. It is **not** intended as a recommendation for password storage.

For authentication systems, passwords should be stored using an appropriate password hashing scheme.

See:

* `docs/PRIVACY.md`
* `docs/THREAT_MODEL.md`

---

## Project Structure

```text
passwordlens/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PRIVACY.md
│   └── THREAT_MODEL.md
│
├── src/
│   └── passwordlens/
│       ├── __init__.py
│       ├── analyzer.py
│       ├── exposure.py
│       ├── findings.py
│       ├── main.py
│       ├── patterns.py
│       ├── risk.py
│       ├── rules.py
│       └── substitutions.py
│
├── tests/
│   ├── test_analyzer.py
│   ├── test_exposure.py
│   ├── test_risk.py
│   └── test_substitutions.py
│
├── .gitignore
├── LICENSE
├── pyproject.toml
└── README.md
```

---

## Limitations

PasswordLens is an analysis aid, not a guarantee of password security.

It does not model every possible attack.

Out of scope include:

* Phishing
* Malware
* Keylogging
* Credential stuffing against live services
* Unknown password reuse
* Account recovery weaknesses
* MFA weaknesses
* Compromised client systems

A password can also become unsafe after a previously unknown breach.

---

## Future Work

Potential future improvements include:

* Larger password dictionaries
* More advanced sequence detection
* Passphrase intelligence
* Context-aware password analysis
* Improved attacker-oriented guessability modeling
* Secure password/passphrase generation
* Additional authentication security guidance
* Continuous integration
* Web-based interface

Future work should preserve the project's privacy-first design.

---

## Disclaimer

PasswordLens provides security analysis based on the signals implemented by the project.

A low-risk result does not guarantee that a password is secure.

Users should use long, unique passwords or passphrases, avoid password reuse, use a password manager, and enable multi-factor authentication where available.

---

## License

See `LICENSE` for details.
