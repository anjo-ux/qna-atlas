# Institutional access codes (admin)

All routes require header **`X-Admin-Code`** (same value as `ADMIN_CODE` in env; default in dev is often `1127`).

## Behavior

- **While `active: true`**: any number of user accounts can redeem the same plaintext code (each account only once per code).
- **`PATCH ... active: false`**: **new** redemptions of that code fail with a clear message. Users who already redeemed keep normal access until expiry or they remove institutional access in Settings.
- **Plaintext is never stored** — only a bcrypt hash. When you **create** a code, copy the plaintext immediately to send to the institution.

## API

### List codes (no hashes)

`GET /api/admin/institutional-codes`

Response: `{ codes: [{ id, institutionName, active, createdAt }] }`

### Create code

`POST /api/admin/institutional-codes`  
JSON: `{ "plaintextCode": "SPRING2026", "institutionName": "Example University" }`

Response `201`: `{ id, message }`

### Activate / deactivate

`PATCH /api/admin/institutional-codes/:id`  
JSON: `{ "active": false }` or `{ "active": true }`

## Examples

```bash
export ADMIN=your_admin_code

curl -s -H "X-Admin-Code: $ADMIN" https://your-app.com/api/admin/institutional-codes

curl -s -X POST -H "X-Admin-Code: $ADMIN" -H "Content-Type: application/json" \
  -d '{"plaintextCode":"EMORY2026","institutionName":"Emory University"}' \
  https://your-app.com/api/admin/institutional-codes

curl -s -X PATCH -H "X-Admin-Code: $ADMIN" -H "Content-Type: application/json" \
  -d '{"active":false}' \
  https://your-app.com/api/admin/institutional-codes/CODE_UUID_HERE
```
