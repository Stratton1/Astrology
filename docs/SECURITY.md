# COSMOS — Security Model

## Data Classification
- **Sensitive PII:** Birth date, birth time, birth location — encrypted at rest
- **Account PII:** Email — hashed for lookup, encrypted for display
- **Non-sensitive:** Chart calculation results, tradition configurations

## Encryption
- Algorithm: AES-256-GCM for field-level encryption
- Key management: ENCRYPTION_KEY env var, 256-bit, rotatable
- Encrypted fields: Profile.birthDate, Profile.birthTime, Profile.birthLocation
- Key rotation: Re-encrypt all records with new key, keep old key for decryption during migration

## Authentication
- JWT-based: access token (15min TTL), refresh token (7d TTL)
- Password hashing: bcrypt, 12 rounds
- Refresh token rotation on use
- Token stored in httpOnly, secure, sameSite cookies

## Authorization
- Profiles: users can only access their own
- Charts: users can only access charts linked to their profiles
- Synthesis: users can only access synthesis for their charts
- Admin: future consideration, not in v1

## Input Validation
- All API inputs validated with Zod schemas
- Request body size limit: 100KB
- File upload: not supported in v1

## Rate Limiting
- Anonymous: 100 req/min
- Authenticated: 300 req/min
- Synthesis: 10 req/min (expensive)
- By IP + user ID combination

## Transport Security
- HTTPS required in production
- HSTS headers
- CSP headers (strict)

## Logging & Redaction
- pino redaction paths for PII fields
- Never log: birth data, passwords, tokens, email addresses
- Always log: request IDs, user IDs (opaque), error codes, timing

## Dependencies
- Regular audit with `pnpm audit` and `pip audit`
- No known-vulnerable dependencies allowed in production

## Incident Response
- Sentry for error tracking with PII scrubbing
- Structured logs for forensic analysis
- User data deletion capability for breach response
