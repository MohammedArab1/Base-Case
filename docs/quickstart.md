# Quickstart and two-minute tutorial

This is the fastest path from a downloaded build to a completed practice loop.
For the operating-system warnings on unsigned builds and checksum steps, see
`install.md`.

## 1. Install the app

- **macOS:** open the `.dmg`, drag **Base Case** to `Applications`, then
  double-click it once. When macOS says it could not verify the app, open
  **System Settings → Privacy & Security**, scroll to **Security**, click
  **Open Anyway** for **Base Case**, authenticate, and confirm. The button only
  appears after the blocked launch attempt. See `install.md` for why this is
  expected and for the older “unidentified developer” wording.
- **Windows:** run the `.exe`, choose **More info → Run anyway** on the
  SmartScreen prompt, and finish the installer.
- Both installers bundle Python and Node. You do not need either language on the
  machine, and you do not need an account or a network connection.

## 2. First run (about two minutes)

1. On the welcome screen, choose **Get started**.
2. Pick **Python** or **TypeScript**. You can change this later in Settings.
3. Pick a daily goal. Fifteen minutes is enough for the first day.
4. Leave AI set to **None**. The app is fully usable without it, and you can
   configure a provider later.
5. Choose **Finish**, then **Go to Today**.

## 3. Learn a concept first

1. Open **Learn** and choose **Hash Maps and Sets** (or search for a topic).
2. Read the plain-language explanation, the diagram, and the complexity
   cheatsheet. The lesson works fully offline.
3. Open one of the linked exercises under **Practice this idea**. The coding
   workspace opens on that problem with your normal draft and review state.
4. Choose **Mark as complete** when the idea makes sense. Completion is stored
   locally and can be undone.
5. If AI is enabled, you can select a section and ask for a clarification. The
   app shows the exact lesson excerpt and question before sending anything.

## 4. Solve the sample problem

1. Open **Coding** and select **Pair Sum**.
2. Read the statement and the examples. If you are stuck, reveal **Hint 1**
   first; hints are progressive and reveal level 4 only when you ask for it.
3. Choose **Run samples**. Sample runs are for iteration and do not count as a
   submission.
4. Fix the failing case, then choose **Submit**. Hidden tests run locally in the
   judge sidecar.
5. Read the explanation, tag the mistake you actually made, and write one note
   about the pattern you want to remember.

The first submission creates a review card. Later submissions update the card
automatically. Runs from Review mode never auto-grade.

## 5. Try a system design scenario

1. Open **System Design** and select **URL Shortener**.
2. Read the prompt, requirements, and scale targets.
3. Draw the design on the canvas. The scene saves locally after a short pause.
4. Fill in the notes for each rubric dimension and submit the attempt.
5. Compare with the reference design and the expected-topic checklist.

## 6. Review what you learned

Open **Review** and grade the due card. If nothing is due, the Today view shows
when the next card becomes available. The review queue is driven by FSRS, not a
fixed calendar.

## 7. Check the installation

Open **Settings → Diagnostics** and choose **Run self-test**. A healthy release
build shows PASS for Application, Database, Storage, Logs, Content, Search index,
Judge sidecar, and Language runtimes. The AI check passes when AI is off.

If a check fails, choose **Copy report** and include it in a bug report. The
report contains versions, paths, and check results, but no code, notes, or API
keys.

## Offline check

Disconnect from the network, restart the app, and run the Pair Sum sample tests
again. Everything above except a configured cloud AI provider works offline.
Lessons, linked practice, and lesson completion never need a provider.

## Where your data lives

- **macOS:** `~/Library/Application Support/Base Case/`
- **Windows:** `%APPDATA%\Base Case\`

The SQLite database, design scenes, logs, and verified startup backups live
there. Use **Settings → Backup and transfer → Export data** for a portable JSON
copy. API keys are never included in the export.
