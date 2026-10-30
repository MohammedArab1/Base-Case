# Security Basics for System Design

Security is not one feature. It is a set of small decisions that must all hold at the same time: how data travels, where it rests, who can reach it, and what happens when input is hostile.

## Start with a threat model

A threat model answers four questions:

```text
1. What am I protecting?      money, personal data, accounts, availability
2. Who wants it?              outsiders, malicious users, compromised services
3. How could they get it?     stolen credentials, injection, exposed storage, abuse
4. What happens if they do?   financial loss, privacy breach, outage, fraud
```

Draw the trust boundary.

```text
untrusted: browser, mobile client, public API callers
------------------------------------------------------
trusted:   your server processes, your database, your secrets

But "trusted" is not one thing. A compromised service is inside the boundary.
```

Then design so that one broken assumption does not expose everything.

## Encrypt in transit

Use TLS for every connection that crosses a network, including internal service traffic when the data is sensitive.

```text
client --TLS--> reverse proxy --TLS--> service --TLS--> database
```

TLS protects confidentiality and integrity in transit. It does not protect data after it is decrypted. Certificates should be valid and rotated; HSTS instructs browsers to use HTTPS for future requests to a domain, and it is an enforced policy rather than a preference. For service-to-service identity, mutual TLS can verify both sides.

Do not disable certificate validation to "make it work." That converts encryption into decoration.

## Encrypt at rest

Encryption at rest protects disks, backups, and object storage if the underlying storage is stolen or copied.

```text
data -> encrypted with a data key -> data key encrypted by a master key
```

This is **envelope encryption**. Keep master keys in a managed key service with access control and audit. Rotate keys on a schedule and after suspected exposure.

Encryption at rest does not help if the application can read the data and an attacker has compromised the application. It also does not replace access control.

## Authentication and authorization

- **Authentication** answers "who are you?"
- **Authorization** answers "what may you do?"

Passwords should be hashed with a slow, salted algorithm designed for passwords, such as Argon2id, bcrypt, or scrypt. Never store plaintext or a fast general-purpose hash. Add multi-factor authentication for sensitive accounts.

Sessions and tokens both work:

- A session id in an `HttpOnly`, `Secure` cookie is simple for browser apps.
- A signed token can carry claims and scale across services, but revocation is harder.

Authorization belongs on the server, close to the data. Hiding a button in the UI is not an access control.

```text
bad:  if (user.isAdmin) showDeleteButton()
      server deletes without checking

good: server checks the role and the resource owner on every request
```

## Least privilege

Give every person, service, and token the smallest access it needs.

- Use separate database roles for read and write paths.
- Give each service its own credentials instead of one shared administrator key.
- Scope tokens to specific operations and resources.
- Use short-lived credentials and rotate them.
- Filter by tenant or owner in the query, not only in the UI.

If one service is compromised, least privilege limits the blast radius.

## Treat input as hostile

Validate on the server. Client-side validation is for user experience, not security.

- **Allowlist** accepted shapes, lengths, types, and ranges.
- **Parameterized queries** keep data out of SQL syntax. String concatenation is how SQL injection happens.
- **Output encoding** depends on context: HTML, attribute, URL, JavaScript, and CSS each need different escaping. This prevents cross-site scripting.
- **SSRF**: if the server fetches a user-supplied URL, block internal addresses and cloud metadata endpoints, and use an allowlist where possible.
- **Path traversal**: normalize paths and confirm the result stays inside the intended directory.
- **File uploads**: limit size, verify content type, scan files, generate safe names, and store them outside the web root.
- **Deserialization**: do not deserialize untrusted data into arbitrary objects.

```text
unsafe:  "SELECT * FROM users WHERE name = '" + name + "'"
safe:    query("SELECT * FROM users WHERE name = ?", [name])
```

## Protect secrets

Secrets include API keys, database passwords, signing keys, and provider tokens.

- Keep them out of source control, logs, error messages, and client bundles.
- Load them from a secret manager or protected environment at runtime.
- Give each secret a narrow scope and an owner.
- Rotate on a schedule and immediately after exposure.
- Do not put secrets in URLs or query strings; URLs end up in logs and browser history.

## Abuse controls

Security also means keeping the system usable under hostile traffic.

- Rate limit by account, IP, and API key.
- Use idempotency keys so retries do not duplicate writes.
- Make account recovery and login responses resistant to enumeration.
- Detect credential stuffing with velocity, device, and risk signals.
- Challenge automated abuse without blocking legitimate users.

Rate limiting is both a reliability control and a security control.

## Audit logs

Record security-relevant events:

```text
who       authenticated principal or service
what      action and target
when      timestamp
result    allowed or denied
context   request id, source, relevant metadata
```

Never log passwords, tokens, full card numbers, or user source code. Protect audit logs from tampering and define a retention period. An audit log that nobody can search is not useful during an incident.

## Defense in depth

No single control is perfect. Combine them:

```text
TLS
  + input validation
  + parameterized queries
  + least-privilege credentials
  + encryption at rest
  + rate limits
  + audit logs
```

Fail closed for authentication and authorization. If a check cannot be completed, deny the request rather than assuming it is safe.

## What it costs

- TLS and encryption add CPU and key-management work.
- Password hashing is deliberately slow; size the login capacity for it.
- Strict validation can reject legitimate edge cases if the rules are too narrow.
- Audit logging adds storage and must itself be protected.
- Security reviews and rotation add process, but the cost of a breach is usually higher.

## What to say in an interview

> "All traffic uses TLS 1.2 or newer with HSTS. Data and backups are encrypted at rest, with keys in a managed service and rotated. Each service has scoped credentials and a separate database role. Queries are parameterized, input is allowlisted, and output is context-encoded. Uploads are size-limited, content-checked, scanned, and stored outside the web root. Authentication events and admin actions are audited without logging secrets."

That covers transit, rest, identity, input, secrets, and visibility.
