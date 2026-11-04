# Mirror Slices

A mirror slice is a non-empty contiguous section of a string that reads the same forwards and backwards. Two slices are considered different whenever their start or end positions differ, even if the characters inside them are identical.

Given a string, count all of its mirror slices.

## Input

- `text`: the string whose contiguous palindromic sections are counted.

## Output

The number of palindromic substrings, counting each pair of endpoints separately.

## Examples

**Example 1**

```
Input: text = "level"
Output: 7
```

**Example 2**

```
Input: text = "abac"
Output: 5
```

**Example 3**

```
Input: text = "z"
Output: 1
```

**Example 4**

```
Input: text = "noon"
Output: 6
```

## Constraints

- `1 <= text.length <= 1,000`
- `text` consists of lowercase English letters.
