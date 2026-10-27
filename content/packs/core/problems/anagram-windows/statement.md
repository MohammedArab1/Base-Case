# Anagram Windows

Find every starting index where a substring of `source` is an anagram of `pattern`. Return the indices in ascending order.

A substring is an anagram when it contains exactly the same letters as `pattern` with the same frequencies.

## Input

- `source`: a lowercase string.
- `pattern`: a non-empty lowercase string.

## Output

All valid starting indices in ascending order.

## Examples

**Example 1**

```
Input: source = "cbaebabacd", pattern = "abc"
Output: [0,6]
```

The substrings at `0` (`"cba"`) and `6` (`"bac"`) are anagrams.

**Example 2**

```
Input: source = "abab", pattern = "ab"
Output: [0,1,2]
```

**Example 3**

```
Input: source = "a", pattern = "a"
Output: [0]
```

## Constraints

- `0 <= source.length <= 100,000`
- `1 <= pattern.length <= 100,000`
- Both strings contain only lowercase English letters.

## Follow-up

Can you maintain a count of matching letter frequencies to avoid comparing the whole table at every step?
