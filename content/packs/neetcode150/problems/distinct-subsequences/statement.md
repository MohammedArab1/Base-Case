# Hidden Word Count

Count the number of ways to delete characters from `s` so that the remaining characters, read in order, form `t`. Deleting different positions counts as different even when the remaining strings look identical.

Deleting every character is allowed, so the empty string can be formed in exactly one way from any source string.

## Input

- `s`: the source string, possibly empty.
- `t`: the target string, possibly empty.

## Output

Return the number of deletion choices that leave exactly `t`.

## Examples

**Example 1**

```
Input: s = "banana", t = "ban"
Output: 3
```

Once b is fixed, there are three ways to pick an a and a later n, giving 3 ways.

**Example 2**

```
Input: s = "aaaa", t = "aa"
Output: 6
```

Choose any two of the four a positions: 6 ways.

**Example 3**

```
Input: s = "abc", t = "abc"
Output: 1
```

The only way is to delete nothing.

**Example 4**

```
Input: s = "abc", t = "d"
Output: 0
```

There is no d to keep.

## Constraints

- `0 <= s.length, t.length <= 50`
- Both strings contain only lowercase English letters.
- The answer fits in a signed 64-bit integer.

## Follow-up

How would you count distinct resulting strings rather than distinct deletion choices?
