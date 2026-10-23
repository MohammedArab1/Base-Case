# ADR-0007: AI is optional, bring-your-own-provider, and main-process only

- Status: Accepted
- Date: 2026-10-23
- Deciders: Maintainer
- Supersedes: —

## Context

AI can explain failures, ask Socratic questions, review approaches, and critique
design notes. It is optional and must not become a requirement for core
practice. API keys are sensitive, providers vary, and users may want a local
endpoint with no cloud traffic.

## Decision

Support OpenAI-compatible HTTP providers configured by the user, with no
default key and no app backend. Store keys with Electron `safeStorage`; expose
only provider metadata to the renderer. Make every AI call from the main
process, show a preview of the exact context before the first send, and validate
structured responses against a schema. Support local endpoints (Ollama, LM
Studio) through the same interface. Apple Foundation Models is a post-MVP
sidecar.

## Consequences

Positive:

- No app-level AI cost or key custody.
- Users can disable AI and retain every core feature.
- Local endpoints provide a no-cloud option.
- A single OpenAI-compatible interface covers many providers.

Negative:

- Provider behavior and model quality vary; prompts and evals need to be
  provider-tolerant.
- Streaming, retries, and schema validation add complexity.
- Safe context construction is essential to avoid leaking hidden tests or keys.

## Guardrails

- Never send hidden tests beyond the smallest failing case.
- Redact common secret patterns and absolute home paths.
- No background AI calls and no prompt/response logs by default.
- Label AI output as a hint, never as the canonical answer.
- Refuse requests that ask for a full solution when the hint level is low.

## Follow-up

- Add a mock provider and contract tests in Phase 6.
- Build the leakage/helpfulness eval harness before beta.
