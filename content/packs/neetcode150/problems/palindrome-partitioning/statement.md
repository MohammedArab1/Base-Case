# All Palindrome Splits

Given a string `s`, split it into one or more contiguous, nonempty pieces so that every piece is a palindrome. Return every distinct split.

Use this canonical order:

1. The pieces of a split stay in their original left-to-right order.
2. Sort the list of splits lexicographically. Compare pieces one by one; if one split is a prefix of another, the shorter split comes first.

## Input

- `s`: a nonempty string of lowercase English letters.

## Output

All palindrome splits in the canonical order.

## Examples

**Example 1**

```
Input: s = "a"
Output: [["a"]]
```

**Example 2**

```
Input: s = "aa"
Output: [["a", "a"], ["aa"]]
```

**Example 3**

```
Input: s = "aba"
Output: [["a", "b", "a"], ["aba"]]
```

## Constraints

- `1 <= s.length <= 12`
- `s` contains only lowercase English letters.
