Absolutely — here is the **complete `docs/ARCHITECTURE.md`**, properly formatted and ready to paste.

Open:

```bash
code docs/ARCHITECTURE.md
```

Then replace everything with this:

````markdown
# PasswordLens Architecture

## Overview

PasswordLens uses a modular analysis pipeline designed to separate password policy checks, predictable-pattern detection, exposure analysis, security findings, and overall risk assessment.

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
````

---

## Core Modules

### `analyzer.py`

The primary orchestration layer.

Responsibilities:

* Analyze password composition
* Invoke pattern detectors
* Invoke substitution detection
* Optionally perform exposure checking
* Generate security findings
* Calculate the final risk classification

The analyzer coordinates the individual security checks without placing all detection logic into a single function.

---

### `rules.py`

Contains reusable policy constants and strength-related rules.

Examples include:

* Minimum password length
* Strength thresholds
* Finding identifiers

Keeping these values separate makes password policy easier to modify without changing the analysis architecture.

---

### `patterns.py`

Contains predictable-pattern detection logic.

Current detectors include:

* Common password patterns
* Sequential characters
* Repeated patterns

These checks focus on patterns that may remain predictable even when a password contains multiple character types.

---

### `substitutions.py`

Detects common character substitutions.

Examples:

```text
@ -> a
0 -> o
5 -> s
$ -> s
```

The module can normalize a password before checking whether the underlying value corresponds to a predictable pattern.

This allows PasswordLens to detect passwords that attempt to create complexity through commonly anticipated substitutions.

---

### `findings.py`

Defines the security finding model.

Each finding contains:

* Code
* Title
* Message
* Severity
* Category

Categories currently include:

```text
policy
pattern
exposure
```

This allows the analyzer to explain *why* a password is considered risky rather than returning only a numeric score.

---

### `risk.py`

Converts security findings into an overall risk classification.

The current model distinguishes:

```text
Low
Moderate
High
```

The risk engine operates on findings rather than raw character counts.

This creates a separation between:

* Password composition
* Detected security weaknesses
* Overall observed risk

---

### `exposure.py`

Provides optional breached-password detection.

Responsibilities:

1. Hash the password locally.
2. Split the SHA-1 hash into a prefix and suffix.
3. Send only the first five hexadecimal characters to the range endpoint.
4. Parse returned hash suffixes.
5. Compare the complete suffix locally.
6. Return an explicit exposure state.

Exposure states:

```text
exposed
not_exposed
unknown
```

The exposure check is optional and is disabled by default.

---

## Analysis Pipeline

The complete analysis flow is:

```text
Password
   |
   v
Composition Checks
   |
   v
Policy Findings
   |
   v
Pattern Detection
   |
   +--> Common Patterns
   |
   +--> Sequences
   |
   +--> Repetition
   |
   +--> Predictable Substitutions
   |
   v
Optional Exposure Check
   |
   v
Exposure Finding
   |
   v
Security Findings
   |
   v
Risk Engine
   |
   v
Final Password Analysis
```

---

## Policy vs. Risk

PasswordLens intentionally separates password policy from observed security risk.

### Policy

Answers questions such as:

* Is the password long enough?
* Does it contain uppercase characters?
* Does it contain lowercase characters?
* Does it contain numbers?
* Does it contain symbols?

### Risk

Answers questions such as:

* Is the password a common pattern?
* Does it contain a sequence?
* Does it repeat a predictable value?
* Does it use predictable substitutions?
* Has it appeared in known breach data?

A password can therefore satisfy basic composition requirements while still receiving a high-risk classification.

---

## Privacy Architecture

The core analyzer can operate entirely locally.

The only component requiring external communication is the optional exposure check.

```text
                  LOCAL ENVIRONMENT
        +----------------------------------+
        |                                  |
        |  Password                        |
        |     |                            |
        |     v                            |
        |  Local SHA-1                     |
        |     |                            |
        |     +----> First 5 chars --------+----> External API
        |                                  |
        |  Remaining hash suffix           |
        |          |                       |
        |          v                       |
        |     Local comparison             |
        |                                  |
        +----------------------------------+
```

The complete password is never intentionally sent to the breach service.

---

## Failure Handling

External services are considered unreliable dependencies.

If the exposure service cannot be reached or returns invalid data, PasswordLens produces an `unknown` exposure state rather than assuming the password has not been exposed.

```text
External lookup
      |
      +---- Success ----> Exposed / Not Exposed
      |
      +---- Failure ----> Unknown
```

This prevents availability failures from being interpreted as security guarantees.

---

## Testing Architecture

The test suite covers the analyzer and individual security components.

External network requests are mocked during tests.

This ensures:

* Tests remain deterministic
* Network availability does not affect results
* Test passwords are not sent to external services
* Failure conditions can be reproduced reliably

The project currently contains automated tests for:

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

---

## Design Philosophy

PasswordLens is intentionally modular.

Each security concept has a defined responsibility:

```text
rules          -> policy definitions
patterns       -> predictable pattern detection
substitutions  -> predictable character transformations
exposure       -> breached-password intelligence
findings       -> explainable security observations
risk           -> overall risk classification
analyzer       -> orchestration
main           -> user interface
```

This structure allows individual detection techniques to evolve without turning the analyzer into a monolithic implementation.
