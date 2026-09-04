# PasswordLens Privacy Model

PasswordLens is designed around a privacy-first principle:

> A password should never need to be stored or transmitted in plaintext to evaluate its exposure.

## Password Handling

PasswordLens analyzes the password locally for:

- Length
- Character composition
- Common patterns
- Sequential patterns
- Repetition
- Predictable character substitutions

These checks operate directly on the password provided to the analyzer.

PasswordLens does not log or persist passwords.

## Breached Password Detection

Optional breached-password detection uses the Pwned Passwords range API.

The password is never sent directly to the service.

Instead, PasswordLens:

1. Computes the SHA-1 hash of the password locally.
2. Separates the hash into a 5-character prefix and remaining suffix.
3. Sends only the first 5 characters of the hash to the breach service.
4. Receives matching hash suffixes and breach counts.
5. Performs the final suffix comparison locally.

Conceptually:

```text
Password
   |
   v
SHA-1 hash
   |
   +----------------------+
   |                      |
First 5 chars         Remaining 35 chars
   |                      |
   v                      |
API request               |
                          |
                    Local comparison
                          |
                          v
                 Exposure determination