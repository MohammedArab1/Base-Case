# Troubleshooting and logs

## Where logs live

Base Case writes local logs to:

```text
<app data folder>/logs/app.log
```

Open **Settings → Data and environment → Open logs folder** to reveal the
folder. Rotated files are named `app.1.log` through `app.5.log`; the newest
file is `app.log`. Logging never leaves the machine.

## What is logged

- App startup and version/platform metadata.
- IPC channel names (not payload contents).
- AI request metadata: feature, provider type, model, endpoint host/path,
  whether a key is present, and custom header **names**.
- AI provider HTTP failures with the status and a redacted, truncated response
  detail. These appear as `provider.http_error` or `provider.test_failed`.
- Application and judge errors with diagnostic context.

## What is never logged

- API key values or custom header values.
- User code, prompts, notes, design content, or model responses.
- Hidden test contents beyond the first failure shown in the UI.

Secrets found in provider error text are redacted before they reach the log or
the UI.

## Debugging in development

- `pnpm dev` prints main-process JSON logs to the terminal as well as
  `logs/app.log`. Leave the terminal visible while exercising AI actions.
- The DevTools window that opens with `pnpm dev` is for the **renderer**. Its
  Console shows renderer errors, and its Network tab shows renderer requests.
  AI provider calls and judge execution happen in the Electron **main**
  process, so they do not appear in the renderer Network tab.
- For main-process breakpoints, run:

  ```sh
  pnpm dev:inspect
  ```

  Then open `chrome://inspect` in Chrome/Edge and connect to
  `localhost:9229`. See `apps/desktop/src/main/` for main-process code.

- Useful AI log events:
  - `ai.request`: feature, provider, model, endpoint, key presence, header names.
  - `ai.response`: response character count, whether parsing succeeded, warning.
  - `ai.empty_response`: the provider returned zero characters.
  - `provider.stream_complete`: SSE event/chunk/character counts.
  - `provider.empty_stream`: streaming returned no text.
  - `provider.http_error` / `provider.test_failed`: HTTP status and redacted
    provider detail.

## The model returned text instead of JSON

The app asks for a structured JSON object and shows the raw model response when
parsing fails. If you see “The model returned text instead of a JSON object”,
the raw response is displayed below the warning; copy it to see what the model
actually sent.

Check:

1. The model supports JSON/structured output or follows the prompt. Some
   reasoning or chat-tuned models wrap answers in prose.
2. The provider honors `stream: true`. Use **Test connection** and then check
   `provider.stream_complete` in the logs. `provider.empty_stream` with zero
   characters usually means the endpoint does not stream in OpenAI SSE format.
3. The base URL points at an OpenAI-compatible `/chat/completions` endpoint, not
   a dashboard or proxy landing page.
4. The model name is the provider's exact model ID.

## Debugging a 401 or 403

1. Click **Test connection** in Settings → AI provider. The message now includes
   the provider's response detail when the endpoint returns one.
2. Check the **Base URL**. It should usually end in `/v1`; a full
   `/chat/completions` URL is also accepted.
3. Re-enter the API key, or confirm the stored key is the one the provider
   expects. Whitespace is trimmed before saving. The key is decrypted from the
   OS credential store and sent as `Authorization: Bearer <key>`; it is never
   displayed or logged.
4. If the provider needs routing metadata, add it under **Custom headers
   (JSON)**. OpenCode Go commonly needs:

   ```json
   { "x-opencode-session": "your-session-id" }
   ```

5. Open the logs folder and search for `provider.test_failed`,
   `provider.http_error`, or `ai.request_failed`. The log includes the HTTP
   status and the provider's redacted message, for example:

   ```json
   {
     "event": "provider.test_failed",
     "status": 401,
     "model": "your-model",
     "detail": "{\"type\":\"error\",\"error\":{\"type\":\"MissingSessionID\",\"message\":\"Request is missing x-opencode-session...\"}}"
   }
   ```

6. The AI request log also records `headerNames`. If a header you expected is
   missing, the JSON field did not save; use the exact JSON object syntax shown
   in the placeholder.

If the provider requires a non-Bearer authorization scheme, you can supply an
`Authorization` header in the custom headers field. It overrides the API key
header. Prefer the API key field whenever the provider accepts a Bearer token,
and do not put secrets in custom headers unless necessary; they are stored
locally in plain text.

## Other common issues

- **Judge cannot start:** open Settings → Diagnostics and run the self-test. It
  checks the sidecar, bundled runtimes, database, storage, and content.
- **Imported pack rejected:** the preview lists the exact validation errors.
  See `docs/authoring/pack-import.md` for the expected folder/ZIP layout.
- **AI features disabled:** AI is off by default. Enable it globally and enable
  the specific feature in Settings.
- **Large context warning:** the context preview shows dropped sections and
  token estimates before sending; reduce the included code or raise the context
  window if the provider supports it.
