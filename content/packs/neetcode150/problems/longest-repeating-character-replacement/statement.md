# Replace to Repeat

You are given a string `s` of lowercase English letters and an integer `k`. Choose a contiguous substring, and change at most `k` of its characters into any lowercase letters you like. The goal is to make every character in that substring the same.

Return the maximum length of a substring that can be made uniform this way.

## Input

- `s`: a non-empty string of lowercase English letters.
- `k`: the maximum number of replacements available for the chosen substring.

## Output

The maximum achievable substring length.

## Examples

**Example 1**

```
Input: s = "aabccbb", k = 2
Output: 5
```

Take `"bccbb"` and replace its two `c` characters with `b` to get `"bbbbb"`.

**Example 2**

```
Input: s = "abcde", k = 0
Output: 1
```

With no replacements, only a single-character substring is uniform.

**Example 3**

```
Input: s = "aaaa", k = 0
Output: 4
```

The whole string is already uniform.

**Example 4**

```
Input: s = "xyzxyz", k = 3
Output: 5
```

The substring `"xyzxy"` has two `x`, two `y`, and one `z`. Keeping the two `x` characters and replacing the other three characters uses all three replacements. All six characters have only two of each letter, so making them uniform would require four replacements.

## Constraints

- `1 <= s.length <= 100,000`
- `0 <= k <= s.length`
- Every character of `s` is a lowercase English letter.

## Follow-up

Can you maintain the best window length without rescanning the 26 letter counts at every step?
