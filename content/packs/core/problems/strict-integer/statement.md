# Strict Integer

Parse the first signed integer found at the beginning of `text`.

Rules:

- Skip leading spaces.
- Read an optional `+` or `-` sign.
- Read consecutive decimal digits.
- Stop at the first non-digit.
- If no digits follow the optional sign, return `0`.
- Clamp the result to the signed 32-bit range `[-2147483648, 2147483647]`.

## Input

- `text`: an ASCII string.

## Output

The parsed and clamped integer.

## Examples

**Example 1**

```
Input: text = "42"
Output: 42
```

**Example 2**

```
Input: text = "   -042"
Output: -42
```

**Example 3**

```
Input: text = "4193 with words"
Output: 4193
```

**Example 4**

```
Input: text = "words and 987"
Output: 0
```

## Constraints

- `0 <= text.length <= 200`
- `text` contains printable ASCII characters.

## Follow-up

How do you detect overflow before multiplying the accumulator by ten?
