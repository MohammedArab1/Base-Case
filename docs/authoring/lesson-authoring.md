# Lesson authoring guide

Lessons are the offline learning library that sits beside coding and system-design practice. They teach the idea first, then point to a runnable exercise.

## Required files

```text
lessons/<slug>/
├─ lesson.json
└─ lesson.md
```

Add the slug to the top-level `lessons` array in `pack.json`. Start from the
existing core lessons; there is no separate template yet.

## The tone

Write for a smart person who has never seen the topic.

- Use short sentences and plain words.
- Introduce one idea at a time.
- Say what a data structure or algorithm is _for_ before showing its mechanics.
- Prefer a concrete analogy or picture to a formal definition.
- Do not use hype, "just", "obviously", or "simply".
- Do not copy prose, examples, or diagrams from another course, book, or site.
  The `basecs` series is a useful tone reference, not a text source.

Every lesson should answer:

1. What is it?
2. Why would I use it?
3. What does it look like?
4. What does it cost?
5. When does it go wrong?
6. Can I practice it now?

## lesson.md

The Markdown body is the readable lesson. Use `##` headings for the major
sections; the app shows those headings as optional AI focus choices.

A typical shape:

```md
# Hash Maps and Sets

A one-paragraph hook.

## The idea

Short explanation and an ASCII diagram.

## A worked example

Walk through a tiny input by hand.

## What it costs

Connect the operations back to the complexity table in `lesson.json`.

## When to reach for it

Contrast it with one or two nearby tools.
```

Diagrams should be fenced `text` blocks so they render without a network or a
diagram library. They must stay readable at 1024 px width. Use box-drawing
characters or plain arrows; do not use images that require a remote URL.

## lesson.json

Required fields:

- `schemaVersion`: `1`.
- `id`: `<pack-id>/<slug>`.
- `slug`, `title`, `category`, `summary`, `difficulty`.
- `estimatedMinutes`: a realistic read time, not a promise.
- `order`: the position in the suggested path. Keep orders unique.
- `tags`: searchable labels.
- `prerequisites`: lesson slugs from the same pack.
- `content`: the Markdown filename.
- `keyPoints`: 3–6 short takeaways shown in the side panel.
- `complexity`: at least one row with `operation`, `time`, and `space`. For
  system-design lessons, use latency targets and storage notes as the time and
  space values.
- `exercises`: `problems` and/or `designs`, as pack slugs. Every lesson must link
  at least one exercise. If the library has no exercise for a topic, add a
  problem or design scenario in the same pack.
- `commonMistakes`: 2–4 specific mistakes, not generic advice.
- `interviewNotes`: 2–5 things to say or ask in an interview.
- `checkYourself`: at least one question with a short answer.
- `license` and `attribution`.

Example:

```json
{
  "schemaVersion": 1,
  "id": "core/hash-maps",
  "slug": "hash-maps",
  "title": "Hash Maps and Sets",
  "category": "data-structure",
  "summary": "Turn a slow search into a fast lookup.",
  "difficulty": "easy",
  "estimatedMinutes": 11,
  "order": 3,
  "tags": ["hash-map", "counting"],
  "prerequisites": ["arrays-and-strings"],
  "content": "lesson.md",
  "keyPoints": ["Average O(1) lookup.", "Store what you have seen.", "Check before insert."],
  "complexity": [{ "operation": "Lookup", "time": "O(1) average", "space": "O(n)" }],
  "exercises": { "problems": ["pair-sum", "duplicate-check"], "designs": [] },
  "commonMistakes": ["Pairing a value with itself."],
  "interviewNotes": ["Say the average case."],
  "checkYourself": [{ "question": "Why O(1)?", "answer": "The hash finds a bucket." }],
  "license": "CC-BY-SA-4.0",
  "attribution": "Original lesson by the Base Case contributors."
}
```

## Categories

- `foundation`: Big O, analysis, and shared mental models.
- `data-structure`: arrays, strings, maps, stacks, queues, lists, trees, heaps,
  tries.
- `algorithm`: pointers, windows, sorting, search, traversal, DP.
- `system-design`: requirements, scaling, caching, databases, consistency,
  queues, rate limiting.

## Linking practice

Exercises use pack slugs, not full IDs. The validator checks that every linked
problem or design exists in the same pack.

- Prefer 2–6 exercises per lesson.
- Order them from a focused warm-up to a harder application.
- Include at least one exercise that directly uses the lesson's central idea.
- A design scenario can be a practice exercise for a system-design concept.

If a concept has no exercise, do not hide the gap. Add an original problem or
design scenario and keep the link. The core pack added **Prefix Ledger** for the
trie lesson and **Window Max** for the deque lesson.

## Complexity tables

The table is a cheatsheet, not a proof. Keep it to the operations readers will
actually compare: lookup, insert, delete, traversal, build, and the common
variants. Note whether a bound is average, amortized, or worst case.

Do not claim `O(1)` for a hash map without saying "average" and mentioning
collisions in the prose.

## AI clarification

The optional lesson tutor sends only the lesson title, summary, key points,
complexity rows, the selected section excerpt, and the learner's question. It
must not send self-check answers, common mistakes, or the full pack.

Write lesson prose so it stands alone. If the AI is off, the learner must lose
nothing essential.

## Verification

```sh
pnpm content:validate
pnpm typecheck
pnpm test
```

Then open **Learn**, read the lesson at the minimum window size, open every
linked exercise, and mark the lesson complete and incomplete.

## Review checklist

- [ ] Original explanation; no copied prose, examples, or diagrams.
- [ ] Beginner can follow without prior context.
- [ ] Diagram is readable offline and at 1024 px.
- [ ] Complexity table is accurate and says when it is average or amortized.
- [ ] Every linked exercise exists and runs.
- [ ] At least one exercise directly practices the lesson's idea.
- [ ] Common mistakes are specific.
- [ ] Interview notes are actionable.
- [ ] Self-check answers are correct.
- [ ] License and attribution are present.
