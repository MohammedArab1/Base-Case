# Mirrored Text

A phrase is **mirrored** when its sequence of letters and digits reads the same from both ends. Ignore spaces, punctuation, and letter case.

Decide whether `text` is mirrored.

## Input

- `text`: a string containing letters, digits, spaces, and punctuation.

## Output

`true` when the normalized characters form a palindrome, otherwise `false`.

## Examples

**Example 1**

```
Input: text = "A man, a plan, a canal: Panama"
Output: true
```

**Example 2**

```
Input: text = "race a car"
Output: false
```

**Example 3**

```
Input: text = ""
Output: true
```

An empty normalized string is a palindrome.

## Constraints

- `0 <= text.length <= 200,000`
- `text` contains only printable ASCII characters.

## Follow-up

Can you check it in place with two pointers instead of building a normalized copy?
