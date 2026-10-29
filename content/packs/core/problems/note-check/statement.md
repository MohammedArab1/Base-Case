# Note Check

You want to compose a note by cutting letters out of a source string. Each letter in the source may be used at most once.

Return whether the note can be composed.

## Input

- `note`: the desired text.
- `source`: the available letters.

## Output

`true` if every letter in `note` can be matched with a distinct letter in `source`.

## Examples

**Example 1**

```
Input: note = "canvas", source = "cavnas"
Output: true
```

**Example 2**

```
Input: note = "letter", source = "letr"
Output: false
```

The source does not contain enough `t` and `e` letters.

**Example 3**

```
Input: note = "aab", source = "ab"
Output: false
```

**Example 4**

```
Input: note = "", source = ""
Output: true
```

**Example 5**

```
Input: note = "code", source = "decoy"
Output: true
```

## Constraints

- `0 <= note.length, source.length <= 200,000`
- Both strings contain only lowercase English letters.

## Follow-up

Can you stop scanning as soon as a required count becomes negative?
