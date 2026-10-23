# Security policy

## Reporting a vulnerability

Do not open a public issue for a security vulnerability or a report that could
expose user data.

Use GitHub's private vulnerability reporting for this repository. If that is
unavailable, contact the maintainer through the repository profile and state:

- affected version or commit;
- platform and architecture;
- a short description and impact;
- reproduction steps or a proof of concept;
- whether the issue involves the sandbox, IPC, content importer, AI key
  handling, or data storage.

You should receive an acknowledgement within 7 days. The target for a fix is 90
days; complex issues may take longer. Please allow time for a fix before public
disclosure. Credit is given unless you ask to remain anonymous.

## Scope

In scope:

- Renderer escaping the sandbox or reaching Node/filesystem/process APIs.
- IPC payloads that bypass validation or escalate privileges.
- Judge sandbox escapes, network access, or writes outside the temp directory.
- Orphan or unkillable judge processes.
- API key exposure in logs, renderer memory, exports, or AI context previews.
- Content packs that execute native code or escape schema validation.
- Data loss or corruption in migrations, backups, export, or import.
- Path traversal in content or solution paths.

Out of scope (documented limitations):

- Hidden tests are extractable from the app bundle.
- Windows filesystem isolation is best-effort in the MVP.
- The app is not a hostile-code execution service or a formal assessment tool.
- Time-limit variation across machines.
- Vulnerabilities in third-party dependencies without a feasible project-level
  mitigation (report upstream too, but tell us).

## Supported versions

Pre-alpha: only the latest commit on `main` is supported. Once releases begin,
the latest minor release and the previous minor release receive security fixes.

## Safe harbour

Good-faith research that follows this policy, avoids privacy violations, data
destruction, and service disruption, and gives us reasonable time to respond
will not be pursued or reported by the maintainer.
