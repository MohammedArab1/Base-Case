# Importing a content pack

The importer accepts a folder or a `.zip` archive from **Settings → Content
packs → Import**. Everything is validated before install; the pack is marked
**Unverified** and you are responsible for content you import.

## Folder layout

A pack is a directory containing `pack.json` at its root:

```text
my-pack/
├─ pack.json
├─ problems/
│  └─ echo/
│     ├─ problem.json
│     ├─ statement.md
│     ├─ hints.json
│     ├─ explanation.md
│     ├─ solutions/
│     │  ├─ python.py
│     │  └─ typescript.ts
│     └─ tests/
│        ├─ sample.jsonl
│        └─ hidden.jsonl
├─ designs/
│  └─ my-scenario/
│     ├─ design.json
│     ├─ prompt.md
│     ├─ rubric.json
│     └─ reference.md
└─ lessons/
   └─ my-topic/
      ├─ lesson.json
      └─ lesson.md
```

`designs/` and `lessons/` are optional. Every problem, design, or lesson listed
in `pack.json` must exist. Each problem needs one reference solution per
language you list; Python and TypeScript are expected. Lesson exercise and
prerequisite slugs are checked against the same pack.

## pack.json

```json
{
  "schemaVersion": 1,
  "id": "my-pack",
  "name": "My Interview Pack",
  "version": "0.1.0",
  "license": "CC-BY-SA-4.0",
  "attribution": "Original content by Your Name.",
  "problems": ["echo"],
  "designs": [],
  "lessons": [],
  "collections": [
    {
      "id": "interview-core",
      "name": "Interview Core",
      "description": "A focused subset of this pack.",
      "problems": ["echo"],
      "attribution": "Optional source attribution.",
      "url": "https://example.com/list"
    }
  ]
}
```

- `id` is a lowercase slug using letters, digits, and hyphens.
- `problems`, `designs`, and `lessons` contain the folder names under their
  directories; no paths and no duplicates.
- A lesson needs `lesson.json` and a referenced Markdown file. See
  `lesson-authoring.md`.
- `collections` is optional. Each collection needs a unique `id`, a display
  `name`, a `description`, and a `problems` list. Collection members must also
  appear in the top-level `problems` list. Collections are exposed in the app as
  filters and do not duplicate content.
- `attribution` and `url` are optional collection fields. Use them when the
  collection follows a public study list; link out rather than copying its
  problem text.
- Use `CC-BY-SA-4.0`, `CC-BY-4.0`, or `MIT` for the cleanest validation result.
- IDs are stable. Do not renumber an existing problem.

## ZIP layout

Zip the **contents** of the pack folder so `pack.json` is at the archive root,
or keep a single wrapper folder. These all work:

```text
pack.json
problems/...
```

```text
my-pack/
└─ pack.json
   problems/...
```

```text
packs/
└─ my-pack/
   └─ pack.json
   └─ problems/...
```

A ZIP must be unencrypted and under 100 MB. Expanded content is capped at
200 MB and 10,000 entries. Symlinks, absolute paths, and `..` path segments are
rejected.

## Complete example

The smoke fixture is a small, complete, importable pack:

```text
scripts/fixtures/packs/smoke-fixture/
```

It contains one Python problem (`echo`), sample and hidden tests, hints, an
explanation, and a valid manifest. To try the ZIP flow:

```sh
cd scripts/fixtures/packs/smoke-fixture
zip -r /tmp/echo-pack.zip .
```

Then choose **Import ZIP** in Settings and select `/tmp/echo-pack.zip`.

`content/templates/problem/` and `content/templates/design/` are starting
points for new content, but they do not include a `pack.json`. Copy the smoke
fixture or the core pack layout when creating a new pack.

## Validation rules

The importer checks:

- `pack.json` schema, ID format, version, license, and attribution;
- every referenced problem, design, and lesson, including statements, hints,
  tests, solutions, explanations, rubrics, references, lesson content,
  prerequisites, and linked exercises;
- test counts (3–5 sample, 15–50 hidden are the targets; outside ranges produce
  warnings);
- hint levels (unique, 3–4 entries);
- supported signature types and checkers (`exact`, `unordered`, `set-of-sets`,
  `float`);
- no native code, unsupported checker types, or executable plugins.

Preview shows the pack name, item counts, languages, license, attribution, and
any warnings before installation. Uninstall removes only the pack directory;
attempts, notes, drafts, and review cards that reference the pack are kept.

## Related docs

- `docs/authoring/problem-authoring.md`
- `docs/authoring/design-authoring.md`
- `docs/authoring/lesson-authoring.md`
- `docs/authoring/content-policy.md`
- `docs/adr/0003-content-as-data.md`
