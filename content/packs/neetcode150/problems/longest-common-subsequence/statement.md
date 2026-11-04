# Shared Thread

A shared thread between two strings is a sequence of characters that appears in both strings in the same relative order. The chosen characters do not need to be contiguous in either string.

Given two strings, return the length of their longest shared thread.

## Input

- `first`: the first string.
- `second`: the second string.

## Output

The length of the longest common subsequence of the two strings.

## Examples

**Example 1**

```
Input: first = "harvest", second = "traverse"
Output: 4
```

**Example 2**

```
Input: first = "pebble", second = "treble"
Output: 4
```

**Example 3**

```
Input: first = "garden", second = "danger"
Output: 2
```

**Example 4**

```
Input: first = "", second = "drum"
Output: 0
```

## Constraints

- `0 <= first.length, second.length <= 500`
- Both strings consist of lowercase English letters.
