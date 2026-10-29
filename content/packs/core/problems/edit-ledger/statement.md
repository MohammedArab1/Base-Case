# Edit Ledger

An editing tool tracks how many single-character operations are needed to turn one string into another. The allowed operations are:

- insert one character;
- delete one character;
- replace one character.

Given a `source` string and a `target` string, return the minimum number of operations needed to transform `source` into `target`.

## Input

- `source`: the starting string, possibly empty.
- `target`: the desired string, possibly empty.

## Output

The minimum number of single-character operations.

## Examples

**Example 1**

```
Input: source = "planet", target = "plant"
Output: 1
```

Delete the `e`.

**Example 2**

```
Input: source = "stream", target = "steam"
Output: 1
```

Delete the `r`.

**Example 3**

```
Input: source = "", target = ""
Output: 0
```

**Example 4**

```
Input: source = "orbit", target = ""
Output: 5
```

All five characters must be deleted.

**Example 5**

```
Input: source = "garden", target = "guard"
Output: 3
```

## Constraints

- `0 <= source.length, target.length <= 1,000`
- Both strings contain Unicode characters, but no combining marks or emoji.

## Follow-up

Can you reconstruct one optimal sequence of edits, not just its length?
