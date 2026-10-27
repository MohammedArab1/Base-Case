# Longest Mirror

Find the longest contiguous substring of `text` that reads the same forwards and backwards.

If several substrings share the longest length, return the one that starts earliest. If `text` is empty, return the empty string.

## Input

- `text`: a lowercase string.

## Output

The longest palindromic substring.

## Examples

**Example 1**

```
Input: text = "babad"
Output: "bab"
```

Both `"bab"` and `"aba"` have length three; `"bab"` starts earlier.

**Example 2**

```
Input: text = "cbbd"
Output: "bb"
```

**Example 3**

```
Input: text = "a"
Output: "a"
```

## Constraints

- `0 <= text.length <= 2,000`
- `text` contains only lowercase English letters.

## Follow-up

Can you reach linear time with a more advanced string algorithm?
