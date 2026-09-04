Absolutely. Here is the **entire `THREAT_MODEL.md` properly formatted as Markdown**. You can copy everything inside the code block and paste it directly into:

```text
docs/THREAT_MODEL.md
```

````markdown
# PasswordLens Threat Model

## 1. Purpose

PasswordLens evaluates password security from an attacker's perspective rather than relying solely on character-composition rules.

The system identifies:

- Weak password composition
- Common password patterns
- Sequential patterns
- Repeated patterns
- Predictable character substitutions
- Known breached passwords

The goal is to provide explainable security findings while minimizing exposure of sensitive password material.

---

## 2. Assets

The primary sensitive asset is:

- The password entered by the user

Secondary assets include:

- Password-derived hashes
- Exposure lookup results
- Analysis results

PasswordLens should treat all password input as sensitive data.

---

## 3. Trust Boundaries

There are two primary trust boundaries.

### Local Analysis Boundary

```text
User
  |
  v
PasswordLens
  |
  +--> Local analysis
  |
  +--> Risk calculation
````

Local analysis should not require network access.

### External Exposure Boundary

```text
User
  |
  v
PasswordLens
  |
  v
SHA-1 prefix
  |
  v
Pwned Passwords API
```

Only the minimum information required for the range query should cross this boundary.

The complete password must not be transmitted to the external service.

---

## 4. Threats

### T1 — Password Exposure Through Logging

**Threat:**

A password could accidentally be written to logs, terminal output, files, or debugging information.

**Impact:**

High.

A leaked password may be directly usable against another service if password reuse exists.

**Mitigation:**

PasswordLens does not intentionally log or persist plaintext passwords.

Future functionality should preserve this behavior.

---

### T2 — Password Exposure During Breach Checking

**Threat:**

A password could be transmitted directly to an external breach service.

**Impact:**

High.

**Mitigation:**

PasswordLens performs the SHA-1 hashing operation locally and sends only the first five hexadecimal characters of the hash for the range lookup.

The returned suffixes are compared locally.

---

### T3 — False Sense of Security

**Threat:**

A password may satisfy composition requirements while still being predictable.

For example:

```text
P@ssword123!
```

may contain:

* Uppercase characters
* Lowercase characters
* Numbers
* Symbols

while still following a highly predictable construction.

**Impact:**

High.

**Mitigation:**

PasswordLens separates policy checks from security-risk analysis and detects predictable patterns and substitutions.

---

### T4 — Exposure Lookup Failure

**Threat:**

The external breach service may be unavailable or return an invalid response.

**Impact:**

A failed lookup could incorrectly be interpreted as evidence that a password is safe.

**Mitigation:**

PasswordLens distinguishes:

```text
Exposed
Not Exposed
Unknown
```

An unavailable lookup is never treated as confirmation that a password is safe.

---

### T5 — Predictable Transformations

**Threat:**

Users may attempt to increase password complexity through predictable substitutions such as:

```text
a -> @
s -> $
o -> 0
```

**Impact:**

These transformations may provide significantly less additional resistance to guessing than users expect.

**Mitigation:**

PasswordLens normalizes common substitutions and checks whether the resulting value corresponds to a predictable pattern.

---

### T6 — Overreliance on a Single Score

**Threat:**

Users may interpret a single strength label as a complete security guarantee.

**Impact:**

High.

Password security depends on context, attacker capabilities, reuse, authentication controls, MFA, and other factors outside PasswordLens.

**Mitigation:**

PasswordLens provides explainable findings and distinguishes password policy from observed risk.

---

## 5. Out of Scope

PasswordLens does not attempt to model every password attack.

Out of scope include:

* Credential stuffing against live services
* Phishing
* Malware-based credential theft
* Keylogging
* Password reuse across unknown services
* Account recovery vulnerabilities
* MFA weaknesses
* Server-side password storage implementation
* Compromise of the user's local machine

PasswordLens evaluates the password itself and selected observable risk signals.

---

## 6. Security Principles

PasswordLens follows these principles:

1. Analyze locally whenever possible.
2. Minimize sensitive information leaving the local environment.
3. Never store plaintext passwords unnecessarily.
4. Treat external security information as potentially unavailable.
5. Separate policy compliance from actual guessability.
6. Explain why a password is considered risky.
7. Avoid presenting security estimates as guarantees.

---

## 7. Residual Risk

PasswordLens cannot guarantee that a password is secure.

A password classified as low risk may still be compromised through:

* Password reuse
* Targeted attacks
* Phishing
* Malware
* Previously unknown breaches
* Weak authentication systems

The analyzer should therefore be treated as a security assessment aid rather than a guarantee of password safety.