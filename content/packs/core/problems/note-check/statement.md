# Note Check

You want to compose a note by cutting letters out of a source string. Each letter in the source may be used at most once. Letters are case-sensitive.

Return whether the note can be composed.

## Input

- `note`: the desired text.
- `source`: the available letters.

## Output

`true` if every letter in `note` can be matched with a distinct letter in `source`.

## Examples

**Example 1**

```
Input: note = "a", source = "b"
Output: false
```

**Example 2**

```
Input: note = "aa", source = "ab"
Output: false
```

**Example 3**

```
Input: note = "aa", source = "aab"
Output: true
```

## Constraints

- `0 <= note.length, source.length <= 200,000`
- Both strings contain only lowercase English letters.

## Follow-up

Can you stop scanning as soon as a required count becomes negative?
