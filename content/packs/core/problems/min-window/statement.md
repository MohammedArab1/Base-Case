# Min Window

Find the shortest contiguous substring of `source` that contains every character of `target`, including repeated characters with at least the same multiplicity.

If several substrings have the same shortest length, return the one that starts earliest. If no such substring exists, return the empty string.

## Input

- `source`: a lowercase string.
- `target`: a lowercase string.

## Output

The shortest covering substring, or `""`.

## Examples

**Example 1**

```
Input: source = "adobecodebanc", target = "abc"
Output: "banc"
```

**Example 2**

```
Input: source = "a", target = "a"
Output: "a"
```

**Example 3**

```
Input: source = "a", target = "aa"
Output: ""
```

## Constraints

- `0 <= source.length <= 100,000`
- `0 <= target.length <= 100,000`
- Both strings contain only lowercase English letters.

## Follow-up

Can you track how many distinct target letters have reached their required count without rescanning the frequency table?
