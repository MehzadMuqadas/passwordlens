# Design Decisions

## Decision 001 — Separate policy checks from risk analysis

PasswordLens will separate basic password-policy compliance from
broader security-risk analysis.

### Reason

A password can satisfy common composition requirements while still
containing predictable patterns.

The initial implementation will therefore focus on measurable
composition requirements, while later versions will add
predictability analysis as a separate layer.

### Status

Accepted