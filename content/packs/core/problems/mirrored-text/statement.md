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
Input: text = "Taco cat"
Output: true
```

Ignoring case and the space gives `"tacocat"`.

**Example 2**

```
Input: text = "Rust is fun"
Output: false
```

**Example 3**

```
Input: text = ""
Output: true
```

An empty normalized string is a palindrome.

**Example 4**

```
Input: text = "12, 21"
Output: true
```

Digits count as characters; punctuation and spaces do not.

**Example 5**

```
Input: text = "Zz"
Output: true
```

Case is ignored.

## Constraints

- `0 <= text.length <= 200,000`
- `text` contains only printable ASCII characters.

## Follow-up

Can you check it in place with two pointers instead of building a normalized copy?
