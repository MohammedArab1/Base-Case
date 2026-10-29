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
Input: text = "levelup"
Output: "level"
```

**Example 2**

```
Input: text = "abaxyz"
Output: "aba"
```

**Example 3**

```
Input: text = "civic"
Output: "civic"
```

**Example 4**

```
Input: text = "aabbaa"
Output: "aabbaa"
```

**Example 5**

```
Input: text = "xyz"
Output: "x"
```

Every substring is length `1`, so the earliest one wins.

## Constraints

- `0 <= text.length <= 2,000`
- `text` contains only lowercase English letters.

## Follow-up

Can you reach linear time with a more advanced string algorithm?
