# COSMOS — API Design Reference

## Base URL
`/api/v1/`

## Authentication
- **JWT-based:** Access token (15min), Refresh token (7d)
- **Header:** `Authorization: Bearer <token>`
- **Password hashing:** bcrypt, 12 rounds

### Auth Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Create account |
| POST | /auth/login | No | Login, get tokens |
| POST | /auth/refresh | No | Refresh access token |

### Profile Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /profiles | Yes | List user's profiles |
| POST | /profiles | Yes | Create profile |
| GET | /profiles/:id | Yes | Get profile (own only) |
| PUT | /profiles/:id | Yes | Update profile |
| DELETE | /profiles/:id | Yes | Delete profile |

### Chart Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /charts/calculate | Yes | Calculate natal chart |
| GET | /charts/:id | Yes | Get chart by ID |

### Synthesis Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /synthesis/generate | Yes | Start synthesis job |
| GET | /synthesis/:id | Yes | Get synthesis result |
| GET | /synthesis/status/:jobId | Yes | Poll job status |

### Health Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Alive check |
| GET | /ready | No | Dependency check |

## Error Envelope
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": { "field": "email", "issue": "required" },
    "requestId": "uuid-v4"
  }
}
```

## Rate Limits
- Anonymous: 100 req/min
- Authenticated: 300 req/min
- Synthesis: 10 req/min

## Pagination
```json
{ "data": [...], "cursor": "abc123", "hasMore": true }
```

## Validation
All inputs validated with Zod schemas from @cosmos/types at the API boundary.
