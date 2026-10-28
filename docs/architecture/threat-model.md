# Threat model v1

- Status: Accepted for MVP planning
- Last reviewed: 2026-10-23
- Review cadence: monthly and before every release

This is a practice tool, not an official judge and not a hostile-code
execution service. The goal is to prevent accidental damage, runaway resource
use, and data exfiltration, not to resist a determined kernel exploit.

## Assets

- User code, solutions, plans, and notes.
- AI API keys and provider configuration.
- Progress, review history, mistake tags, and design attempts.
- The host filesystem and network.
- App integrity and release artifacts.

## Actors and trust levels

| Actor                  | Trust                 |
| ---------------------- | --------------------- |
| User                   | Trusted               |
| User's own code        | Semi-trusted          |
| Imported content packs | Untrusted             |
| AI provider            | External, user-chosen |
| Network                | Untrusted             |
| Dependencies           | Supply-chain risk     |

## Trust boundaries

1. Renderer ↔ main process: every IPC payload is untrusted and validated.
2. Main ↔ judge sidecar: JSONL protocol, validated requests, bounded lines.
3. Judge ↔ language child: test input only; no expected outputs, no secrets,
   no network, temp directory only.
4. App ↔ AI provider: explicit user action, context preview, minimal data.
5. App ↔ imported content: data-only schema validation; no native code.

## Threats and mitigations

| Threat                                      | Mitigation                                                                             |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| User code reads/writes personal files       | Seatbelt/Job Objects, temp directory, deny home reads/writes                           |
| User code exfiltrates data                  | Deny network in the judge; no secrets in the environment                               |
| Fork bomb / runaway process                 | Process-group kill, 64-process sampling limit, Windows ActiveProcessLimit, watchdog    |
| Infinite output                             | Byte caps on stdout/stderr; kill on overflow                                           |
| Memory exhaustion                           | Memory sampling, language multipliers, hard kill                                       |
| Malicious content pack executes native code | Content is data only; no plugins; built-in checkers                                    |
| Malicious lesson Markdown                   | Sanitized Markdown, no raw HTML, no remote images; lessons are pack data only          |
| Prompt injection in code/comments           | Delimit data, system guardrails, no tools, output schema                               |
| API key theft                               | `safeStorage`, main-process only, never in logs or renderer                            |
| AI provider sees sensitive data             | Explicit preview/consent, minimal context, optional redaction; lesson answers excluded |
| Supply-chain attack                         | Lockfiles, Dependabot, `pnpm audit`, minimal dependencies                              |
| Unsigned app tampering                      | Checksums, release notes, signing later                                                |
| Hidden-test extraction                      | Accept as a known limitation; hidden tests are not a security boundary                 |

## Electron hardening

- `nodeIntegration: false`.
- `contextIsolation: true`.
- `sandbox: true` for the renderer where possible.
- Preload exposes a narrow allowlist; no raw `ipcRenderer`.
- Validate every IPC payload with Zod.
- Strict CSP: no remote scripts; no `unsafe-eval` unless a dependency requires
  it and the exception is documented.
- Block navigation; open external links in the system browser.
- Disable `<webview>` unless explicitly needed.
- No remote module.
- Bundle all renderer assets locally.
- Sanitize Markdown; no raw HTML.

## AI privacy

- Keys in `safeStorage`.
- Context preview before sending.
- No automatic background calls.
- No prompt/response logs by default.
- Optional local history with a delete button.
- Clear notice when using a cloud provider.
- Support local endpoints (Ollama, LM Studio).
- Never send hidden tests beyond the first failure.
- Redact common secret patterns before sending.

## Data durability

- SQLite WAL mode.
- Transactional writes for attempts and results.
- Debounced autosave for code and canvas; flush on blur and shutdown.
- Daily backups; verify before pruning; keep the last seven.
- Export/import tested in CI.
- Mark incomplete attempts `interrupted` on restart; keep the code.

## Logging and diagnostics

- Structured local logs with levels; rotate and cap total size.
- Redact API keys, Authorization headers, and absolute home paths.
- Diagnostics export includes versions, judge self-test, pack versions, and
  recent errors; excludes code and keys by default.
- No telemetry. A crash dialog offers restart and diagnostics export.

## Residual risks

- `sandbox-exec` is deprecated and may be removed by Apple.
- Windows filesystem isolation is best-effort in the MVP, and Windows does not
  block network access. Imported content is not safely isolated on Windows.
- Hidden tests can be extracted from the app bundle.
- Imported content may include malicious inputs; users import at their own risk.
- The app is not suitable for hostile code execution or formal assessment.
- Absolute time limits vary by machine.

## Security reporting

See `SECURITY.md`. Do not open a public issue for a vulnerability.
