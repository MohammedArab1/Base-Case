# Performance measurements — Phase 9

Last measured: 2026-10-25
Build: unsigned macOS arm64 release bundle, bundled Python 3.12.15 and Node
24.22.0, `pnpm package:mac`.

Run:

```sh
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm package:mac
node scripts/measure-packaged.mjs
```

The script launches the packaged app with a fresh profile, completes
onboarding, loads the coding library, opens Pair Sum, runs the sample suite
through the real judge, opens the design workspace and Excalidraw canvas, and
samples the process tree. It never contacts the network.

## Budgets and results

| Measurement                     | Budget | Result   | Status |
| ------------------------------- | ------ | -------- | ------ |
| Cold start to first shell       | < 4000 | 2488 ms  | Pass   |
| Coding library ready            | < 750  | 323 ms   | Pass   |
| Problem open to editor ready    | < 250  | 44 ms    | Pass   |
| Design scenario to canvas ready | < 1500 | 415 ms   | Pass   |
| Judge sample run (5 tests)      | < 2000 | 385 ms   | Pass   |
| Idle memory, whole process tree | < 600  | 290.8 MB | Pass   |
| Working memory after canvas     | < 900  | 343.5 MB | Pass   |
| macOS DMG                       | < 350  | 253.0 MB | Pass   |
| macOS ZIP                       | < 350  | 253.8 MB | Pass   |
| App bundle on disk              | —      | 688.1 MB | —      |

The idle figure includes Electron helpers and the spawned judge sidecar. The
working figure is sampled four seconds after the design canvas finishes
loading. Results vary with the machine, OS build, and whether the app has been
recently launched; record the machine and date when comparing releases.

## Notes

- The judge sidecar is spawned lazily, so bundling Python and Node does not
  affect cold start.
- First judge runs include runtime warm-up; subsequent tests are much faster.
- Excalidraw is the largest renderer chunk (~1.6 MB) and dominates design open
  time. It is loaded only when the design workspace opens.
- App size stayed under budget after adding the second macOS architecture and
  the 25 + 8 content set. Splitting or pruning Excalidraw/Mermaid chunks is the
  main future optimization if the budget tightens.
- Windows numbers are recorded by the manual installer workflow (B2); CI does
  not run packaged performance measurements.

## What is not measured here

- Long sessions with thousands of attempts or notes.
- A 100,000-element judge submission (covered by judge conformance tests, not
  this end-to-end script).
- GPU-heavy canvas scenes or very large Excalidraw files.
- High-DPI and multi-monitor window rendering.

These should be sampled during the private beta (B10) on real user hardware.
