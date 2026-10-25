# Longest Unique Stretch

Given a string `text`, return the length of the longest contiguous substring that contains no repeated character.

Characters are case-sensitive, so `'a'` and `'A'` are different. An empty string has length `0`.

## Input

- `text`: a string of printable ASCII characters.

## Output

The length of the longest substring with all distinct characters.

## Examples

**Example 1**

```
Input: text = "abcabcbb"
Output: 3
```

The longest unique stretches are `"abc"`, `"bca"`, and `"cab"`.

**Example 2**

```
Input: text = "bbbbb"
Output: 1
```

Every stretch contains the same character repeated, so the best is a single `"b"`.

**Example 3**

```
Input: text = "pwwkew"
Output: 3
```

`"wke"` has three distinct characters. `"pwke"` is not contiguous.

**Example 4**

```
Input: text = ""
Output: 0
```

**Example 5**

```
Input: text = "dvdf"
Output: 3
```

`"vdf"` has three distinct characters.

## Constraints

- `0 <= text.length <= 100,000`
- `text` contains printable ASCII characters.

## Follow-up

How would you return the substring itself rather than its length?
