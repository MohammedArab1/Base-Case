# Demo walkthrough

![Base Case demo walkthrough](assets/demo/base-case-demo.gif)

A 10-second automated walkthrough of the local workspace:

1. Today.
2. The coding library.
3. Pair Sum with the TypeScript editor.
4. A failed sample run with structured feedback.
5. The 14-day activity chart on Progress.
6. The design scenario list and Excalidraw canvas.
7. The command palette.

The clip is generated from real renderer frames, not a mockup. It is captured by
Playwright from a fresh local profile with the mock AI provider off; no account,
network request, or personal data is involved.

- [MP4 version](assets/demo/base-case-demo.mp4)
- [Poster frame](assets/demo/poster.png)

## Regenerate

```sh
pnpm build
pnpm demo:record
```

`pnpm demo:record` requires `ffmpeg` on `PATH`, launches the built Electron app
with a temporary profile, captures frames at roughly 4 fps, and writes the MP4,
GIF, and poster. Frames are deleted unless `KEEP_DEMO_FRAMES=1` is set. The
recording is intentionally short; use a real screen recording for voiceover or
a full release walkthrough.
