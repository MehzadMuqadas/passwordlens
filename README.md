# PasswordLens

> Don't just score passwords. Explain their risk.

**Live:** https://passwordlens.onrender.com

PasswordLens is a password security analyzer built around a simple idea:

**Complexity ≠ unpredictability.**

A password can contain uppercase letters, numbers, and symbols and still be extremely predictable.

For example:

`P@55w0rd`

It passes common complexity rules.

PasswordLens recognizes that `@ → a`, `5 → s`, and `0 → o`, revealing the underlying pattern:

`password`

That's the kind of signal a basic password strength meter can miss.

## What it checks

- Password composition
- Common password patterns
- Sequential characters
- Repetition
- Predictable substitutions
- Known breach exposure
- Explainable security findings

Instead of returning only a score, PasswordLens tells you **why** something is risky.

## Privacy

Exposure checking is optional.

When enabled, PasswordLens uses a k-anonymity style range lookup:

1. The password is hashed locally.
2. Only the first 5 characters of the SHA-1 hash are sent to the breach service.
3. Matching suffixes are returned.
4. The comparison happens locally.

The plaintext password is not intentionally sent to the breach service.

Exposure failures are treated as **unknown**, not as evidence that a password is safe.

## Architecture

```text
Input
  ↓
Password Analyzer
  ├── Policy checks
  ├── Pattern detection
  ├── Substitution detection
  └── Exposure lookup
          ↓
   Security Findings
          ↓
     Risk Engine
````

The analyzer is split into small modules so individual security checks can be tested independently.

## Run locally

```bash
git clone https://github.com/MehzadMuqadas/passwordlens.git
cd passwordlens

python3 -m venv .venv
source .venv/bin/activate

pip install .
passwordlens
```

Run the tests:

```bash
pytest
```

Current test suite:

**53 tests passing.**

## Why I built it

Password strength meters often reward complexity rules:

> uppercase + number + symbol = strong

But attackers don't necessarily see passwords that way.

PasswordLens explores the gap between **policy compliance** and **actual predictability**.

That's the problem I wanted to make visible.

## Project docs

* [Architecture](docs/ARCHITECTURE.md)
* [Threat Model](docs/THREAT_MODEL.md)
* [Privacy](docs/PRIVACY.md)

## License

MIT

```

**That is much stronger.**

It gives someone scrolling your GitHub:

**What is it? → Why is it interesting? → Show me → How does it work? → Can I run it? → Is it serious?**

And then they can dig into `docs/` if they want the deeper engineering material.

One more thing: because the current README still says **“Future Work → Web-based interface,”** I would absolutely fix that before we announce the project. :contentReference[oaicite:5]{index=5}

**I would rewrite it now.** This is one of the last things I'd polish before you start putting PasswordLens on your LinkedIn/X/GitHub portfolio.
```
