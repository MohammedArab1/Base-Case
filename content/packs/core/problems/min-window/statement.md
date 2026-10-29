# Min Window

Find the shortest contiguous substring of `source` that contains every character of `target`, including repeated characters with at least the same multiplicity.

If several substrings have the same shortest length, return the one that starts earliest. If no such substring exists, return the empty string. If `target` is empty, return the empty string.

## Input

- `source`: a lowercase string.
- `target`: a lowercase string.

## Output

The shortest covering substring, or `""`.

## Examples

**Example 1**

```
Input: source = "xbaxyzab", target = "ab"
Output: "ba"
```

The windows `"ba"` and `"ab"` both have length `2`, but `"ba"` starts earlier.

**Example 2**

```
Input: source = "qwertyuiop", target = "ty"
Output: "ty"
```

**Example 3**

```
Input: source = "aaabbbccc", target = "abc"
Output: "abbbc"
```

**Example 4**

```
Input: source = "a", target = "aa"
Output: ""
```

The source does not contain two copies of `a`.

**Example 5**

```
Input: source = "mangoesandkiwis", target = "aei"
Output: "esandki"
```

## Constraints

- `0 <= source.length <= 100,000`
- `0 <= target.length <= 100,000`
- Both strings contain only lowercase English letters.

## Follow-up

Can you track how many distinct target letters have reached their required count without rescanning the frequency table?
